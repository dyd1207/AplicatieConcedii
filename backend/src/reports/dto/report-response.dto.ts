export type ReportTotalsDto = {
  totalRequests: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  daysRequested: number;
  effectiveDaysApproved: number;
  interruptedCount: number;
};

export type ReportRowDto = {
  id: number;
  requesterId: number;
  requesterName: string | null;

  type: string;
  status: string;

  startDate: string;
  endDate: string;
  daysCount: number;

  approvedById: number | null;
  approvedByName: string | null;

  interruptedAt: string | null;
  interruptedById: number | null;
  interruptedByName: string | null;

  effectiveDays: number;
};

//
export type LeaveBalanceLineDto = {
  annualDays: number;
  carryoverDays: number;
  usedDays: number;
  remainingDays: number;
};

export type ReportBalanceUserDto = {
  userId: number;
  username: string | null;
  fullName: string | null;

  CO?: LeaveBalanceLineDto;
  COR?: LeaveBalanceLineDto;
};

export type ReportBalancesTotalsDto = {
  CO?: LeaveBalanceLineDto;
  COR?: LeaveBalanceLineDto;
};

export type ReportResponseDto = {
  interval: { start: string; end: string };
  totals: ReportTotalsDto;
  rows: ReportRowDto[];

  balancesYear: number;
  balances: ReportBalanceUserDto[];
  balancesTotals: ReportBalancesTotalsDto;
};