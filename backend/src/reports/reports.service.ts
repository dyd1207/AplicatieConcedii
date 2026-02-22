import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { calculateEffectiveDays } from "./utils/leave.utils";
import { addDays, startOfMonth, startOfWeekMonday, startOfYear, startOfDay } from "./utils/date.utils";
import type { ReportResponseDto } from "./dto/report-response.dto";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildAccessWhere(user: { id: number; roles: string[] }) {
    // dacă e doar ANGAJAT -> vede doar ale lui
    const roles = user.roles ?? [];
    const employeeOnly = roles.length === 1 && roles.includes("ANGAJAT");
    if (employeeOnly) return { requesterId: user.id };
    return {};
  }

  private async buildReport(params: {
    start: Date;
    endExclusive: Date;
    user: { id: number; roles: string[] };
  }): Promise<ReportResponseDto> {
    const { start, endExclusive, user } = params;
    const accessWhere = this.buildAccessWhere(user);

    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        ...accessWhere,
        // intersecție interval
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

      const requesterName =
        (r as any).requester?.fullName ?? (r as any).requester?.username ?? null;

      const approvedByName =
        (r as any).approvedBy?.fullName ?? (r as any).approvedBy?.username ?? null;

      const interruptedByName =
        (r as any).interruptedBy?.fullName ?? (r as any).interruptedBy?.username ?? null;

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

    return {
      interval: { start: start.toISOString(), end: endExclusive.toISOString() },
      totals,
      rows,
    };
  }

  async weekly(params: { weekStart?: string; user: { id: number; roles: string[] } }) {
    const base = params.weekStart ? new Date(params.weekStart) : new Date();
    const monday = startOfWeekMonday(base);
    const start = startOfDay(monday);
    const endExclusive = addDays(start, 7);
    return this.buildReport({ start, endExclusive, user: params.user });
  }

  async monthly(params: { year: number; month: number; user: { id: number; roles: string[] } }) {
    const start = startOfMonth(params.year, params.month);
    const endExclusive = startOfMonth(params.year, params.month + 1);
    return this.buildReport({ start, endExclusive, user: params.user });
  }

  async yearly(params: { year: number; user: { id: number; roles: string[] } }) {
    const start = startOfYear(params.year);
    const endExclusive = startOfYear(params.year + 1);
    return this.buildReport({ start, endExclusive, user: params.user });
  }
}