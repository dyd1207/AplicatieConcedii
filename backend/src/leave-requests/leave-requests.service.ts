import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  async createDraft(userId: number, dto: { type: "CO" | "COR"; startDate: string; endDate: string; daysCount: number; reason?: string }) {
    return this.prisma.leaveRequest.create({
      data: {
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        daysCount: dto.daysCount,
        reason: dto.reason,
        status: "DRAFT",
        requesterId: userId,
      },
    });
  }

  async submit(userId: number, requestId: number) {
    const req = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Cerere inexistentă.");
    if (req.requesterId !== userId) throw new ForbiddenException("Nu poți trimite cererea altcuiva.");
    if (req.status !== "DRAFT") throw new BadRequestException("Doar cererile draft pot fi trimise.");

    return this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: "SUBMITTED" },
    });
  }

  async approve(approverId: number, requestId: number) {
    const req = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Cerere inexistentă.");
    if (req.status !== "SUBMITTED") throw new BadRequestException("Doar cererile trimise pot fi aprobate.");

    return this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", approvedById: approverId },
    });
  }

  async reject(approverId: number, requestId: number, reason?: string) {
    const req = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Cerere inexistentă.");
    if (req.status !== "SUBMITTED") throw new BadRequestException("Doar cererile trimise pot fi respinse.");

    return this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", approvedById: approverId, reason: reason ?? req.reason },
    });
  }

  async interrupt(interrupterId: number, requestId: number, reason?: string) {
    const req = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Cerere inexistentă.");
    if (req.status !== "APPROVED") throw new BadRequestException("Doar cererile aprobate pot fi întrerupte.");

    return this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: "INTERRUPTED",
        interruptedAt: new Date(),
        interruptedById: interrupterId,
        reason: reason ?? req.reason,
      },
    });
  }
}