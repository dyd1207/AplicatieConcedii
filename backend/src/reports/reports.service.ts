import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { calculateEffectiveDays } from "./utils/leave.utils";
import { addDays, startOfMonth, startOfWeekMonday, startOfYear, startOfDay } from "./utils/date.utils";
import type { ReportResponseDto } from "./dto/report-response.dto";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private getUserId(user: any): number {
    return Number(user?.id ?? user?.sub);
  }

  private isEmployeeOnly(user: any): boolean {
    const roles = user?.roles ?? [];
    return roles.length === 1 && roles.includes("ANGAJAT");
  }

  /**
   * Filtru de acces: ANGAJAT vede doar cererile proprii.
   */
  private buildAccessWhere(user: any) {
    if (this.isEmployeeOnly(user)) {
      return { requesterId: this.getUserId(user) };
    }
    return {};
  }

  private async buildBalances(params: { year: number; user: any }) {
    const { year, user } = params;

    const where: any = { year };
    if (this.isEmployeeOnly(user)) {
      where.userId = this.getUserId(user);
    }

    const entitlements = await this.prisma.leaveEntitlement.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, fullName: true } as any },
      },
      orderBy: [{ userId: "asc" }, { type: "asc" }],
    });

    const map = new Map<number, any>();

    for (const e of entitlements) {
      const u = (e as any).user;

      if (!map.has(e.userId)) {
        map.set(e.userId, {
          userId: e.userId,
          username: u?.username ?? null,
          fullName: u?.fullName ?? null,
        });
      }

      const line = {
        annualDays: e.annualDays,
        carryoverDays: e.carryoverDays,
        usedDays: e.usedDays,
        remainingDays: e.annualDays + e.carryoverDays - e.usedDays,
      };

      const obj = map.get(e.userId);
      obj[e.type] = line; // CO / COR
    }

    const balances = Array.from(map.values());

    const balancesTotals: any = {};
    for (const b of balances) {
      for (const type of ["CO", "COR"] as const) {
        const line = b[type];
        if (!line) continue;

        if (!balancesTotals[type]) {
          balancesTotals[type] = { annualDays: 0, carryoverDays: 0, usedDays: 0, remainingDays: 0 };
        }

        balancesTotals[type].annualDays += line.annualDays;
        balancesTotals[type].carryoverDays += line.carryoverDays;
        balancesTotals[type].usedDays += line.usedDays;
        balancesTotals[type].remainingDays += line.remainingDays;
      }
    }

    return { balances, balancesTotals };
  }

  private async buildReport(params: {
    start: Date;
    endExclusive: Date;
    user: any;
    balancesYear?: number; // opțional
  }): Promise<ReportResponseDto> {
    const { start, endExclusive, user } = params;
    const accessWhere = this.buildAccessWhere(user);

    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        ...accessWhere,
        startDate: { lt: endExclusive },
        endDate: { gt: start },
      },
      include: {
        requester: { select: { id: true, username: true, fullName: true } as any },
        approvedBy: { select: { id: true, username: true, fullName: true } as any },
        interruptedBy: { select: { id: true, username: true, fullName: true } as any },
      },
      orderBy: { startDate: "asc" },
    });

    const rows = requests.map((r) => {
      const effectiveDays = calculateEffectiveDays({
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        interruptedAt: r.interruptedAt,
        daysCount: r.daysCount,
      });

      const requesterName = (r as any).requester?.fullName ?? (r as any).requester?.username ?? null;
      const approvedByName = (r as any).approvedBy?.fullName ?? (r as any).approvedBy?.username ?? null;
      const interruptedByName = (r as any).interruptedBy?.fullName ?? (r as any).interruptedBy?.username ?? null;

      return {
        id: r.id,
        requesterId: r.requesterId,
        requesterName,
        type: r.type,
        status: r.status,
        startDate: r.startDate.toISOString(),
        endDate: r.endDate.toISOString(),
        daysCount: r.daysCount,
        approvedById: r.approvedById ?? null,
        approvedByName,
        interruptedAt: r.interruptedAt ? r.interruptedAt.toISOString() : null,
        interruptedById: r.interruptedById ?? null,
        interruptedByName,
        effectiveDays,
      };
    });

    const totals = rows.reduce(
      (acc, row) => {
        acc.totalRequests += 1;
        acc.daysRequested += row.daysCount;
        acc.effectiveDaysApproved += row.effectiveDays;
        acc.interruptedCount += row.interruptedAt ? 1 : 0;

        acc.byStatus[row.status] = (acc.byStatus[row.status] ?? 0) + 1;
        acc.byType[row.type] = (acc.byType[row.type] ?? 0) + 1;
        return acc;
      },
      {
        totalRequests: 0,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        daysRequested: 0,
        effectiveDaysApproved: 0,
        interruptedCount: 0,
      }
    );

    const balancesYear = params.balancesYear ?? start.getFullYear();
    const { balances, balancesTotals } = await this.buildBalances({ year: balancesYear, user });

    return {
      interval: { start: start.toISOString(), end: endExclusive.toISOString() },
      totals,
      rows,
      balancesYear,
      balances,
      balancesTotals,
    };
  }

  async weekly(params: { weekStart?: string; user: any }) {
    const base = params.weekStart ? new Date(params.weekStart) : new Date();
    const monday = startOfWeekMonday(base);
    const start = startOfDay(monday);
    const endExclusive = addDays(start, 7);

    return this.buildReport({
      start,
      endExclusive,
      user: params.user,
      balancesYear: start.getFullYear(),
    });
  }

  async monthly(params: { year: number; month: number; user: any }) {
    const start = startOfMonth(params.year, params.month);
    const endExclusive = startOfMonth(params.year, params.month + 1);

    return this.buildReport({
      start,
      endExclusive,
      user: params.user,
      balancesYear: params.year,
    });
  }

  async yearly(params: { year: number; user: any }) {
    const start = startOfYear(params.year);
    const endExclusive = startOfYear(params.year + 1);

    return this.buildReport({
      start,
      endExclusive,
      user: params.user,
      balancesYear: params.year,
    });
  }
}