import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type LeaveType = "CO" | "COR";

@Injectable()
export class LeaveBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserBalance(userId: number, year: number) {
    const ent = await this.prisma.leaveEntitlement.findMany({
      where: { userId, year },
      orderBy: { type: "asc" },
    });

    const byType = Object.fromEntries(
      ent.map((e) => [
        e.type,
        {
          year: e.year,
          type: e.type,
          annualDays: e.annualDays,
          carryoverDays: e.carryoverDays,
          usedDays: e.usedDays,
          remainingDays: e.annualDays + e.carryoverDays - e.usedDays,
        },
      ])
    );

    return { userId, year, byType };
  }

  async upsertEntitlement(userId: number, input: { year: number; type: LeaveType; annualDays: number; carryoverDays: number }) {
    return this.prisma.leaveEntitlement.upsert({
      where: { userId_year_type: { userId, year: input.year, type: input.type } },
      update: {
        annualDays: input.annualDays,
        carryoverDays: input.carryoverDays,
      },
      create: {
        userId,
        year: input.year,
        type: input.type,
        annualDays: input.annualDays,
        carryoverDays: input.carryoverDays,
      },
    });
  }

  // ---------- NON-TX (opțional) ----------
  async consumeDays(params: { userId: number; year: number; type: LeaveType; days: number }) {
    return this.consumeDaysTx(this.prisma, params);
  }

  async refundDays(params: { userId: number; year: number; type: LeaveType; days: number }) {
    return this.refundDaysTx(this.prisma, params);
  }

  // ---------- TX variants (folosești în $transaction) ----------
  async consumeDaysTx(tx: any, params: { userId: number; year: number; type: LeaveType; days: number }) {
    if (params.days <= 0) return;

    const ent = await tx.leaveEntitlement.findUnique({
      where: { userId_year_type: { userId: params.userId, year: params.year, type: params.type } },
    });

    if (!ent) throw new NotFoundException("Nu există drepturi setate pentru anul/tipul respectiv.");

    const remaining = ent.annualDays + ent.carryoverDays - ent.usedDays;
    if (remaining < params.days) {
      throw new BadRequestException(`Zile insuficiente. Disponibil: ${remaining}, solicitat: ${params.days}`);
    }

    await tx.leaveEntitlement.update({
      where: { id: ent.id },
      data: { usedDays: { increment: params.days } },
    });
  }

  async refundDaysTx(tx: any, params: { userId: number; year: number; type: LeaveType; days: number }) {
    if (params.days <= 0) return;

    const ent = await tx.leaveEntitlement.findUnique({
      where: { userId_year_type: { userId: params.userId, year: params.year, type: params.type } },
    });

    if (!ent) throw new NotFoundException("Nu există drepturi setate pentru anul/tipul respectiv.");

    const newUsed = Math.max(0, ent.usedDays - params.days);

    await tx.leaveEntitlement.update({
      where: { id: ent.id },
      data: { usedDays: newUsed },
    });
  }
}