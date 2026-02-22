import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type LeaveType = "CO" | "COR";
type RequestStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "CANCELLED" | "INTERRUPTED";

@Injectable()
export class LeaveRequestsService {
  constructor(private prisma: PrismaService) {}

  async createDraft(
    userId: number,
    dto: { type: LeaveType; startDate: string; endDate: string; daysCount: number; reason?: string }
  ) {
    if (!dto.type || !dto.startDate || !dto.endDate || !dto.daysCount) {
      throw new BadRequestException("Câmpuri obligatorii lipsă.");
    }
    if (dto.daysCount <= 0) throw new BadRequestException("daysCount trebuie să fie > 0.");

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException("Format dată invalid.");
    }
    if (end < start) throw new BadRequestException("endDate nu poate fi înainte de startDate.");

    return this.prisma.leaveRequest.create({
      data: {
        type: dto.type,
        startDate: start,
        endDate: end,
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

  async list(
    user: { sub: number; roles: string[] },
    query: {
      status?: RequestStatus;
      type?: LeaveType;
      from?: string; // YYYY-MM-DD
      to?: string;   // YYYY-MM-DD
      requesterId?: string | number;
      page?: string | number;
      pageSize?: string | number;
    }
  ) {
    const page = Math.max(1, Number(query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 20)));
    const skip = (page - 1) * pageSize;

    const roles = user.roles || [];
    const canSeeAll =
      roles.includes("DIRECTOR") ||
      roles.includes("DIRECTOR_ADJUNCT") ||
      roles.includes("SECRETARIAT") ||
      roles.includes("SEF_STRUCTURA");

    const where: any = {};

    // dacă nu are drepturi extinse, vede doar cererile lui
    if (!canSeeAll) {
      where.requesterId = user.sub;
    } else if (query.requesterId) {
      where.requesterId = Number(query.requesterId);
    }

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    if (query.from || query.to) {
      const dateFilter: any = {};
      if (query.from) {
        const d = new Date(query.from);
        if (Number.isNaN(d.getTime())) throw new BadRequestException("Parametrul 'from' este invalid.");
        dateFilter.gte = d;
      }
      if (query.to) {
        const d = new Date(query.to);
        if (Number.isNaN(d.getTime())) throw new BadRequestException("Parametrul 'to' este invalid.");
        dateFilter.lte = d;
      }
      where.startDate = dateFilter;
    }

    const [items, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        include: {
          requester: { select: { id: true, username: true, fullName: true } },
          approvedBy: { select: { id: true, username: true, fullName: true } },
          interruptedBy: { select: { id: true, username: true, fullName: true } },
        },
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return { page, pageSize, total, items };
  }
}