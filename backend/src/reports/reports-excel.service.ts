import { Injectable } from "@nestjs/common";
import ExcelJS from "exceljs";
import type { ReportResponseDto } from "./dto/report-response.dto";

@Injectable()
export class ReportsExcelService {
  private buildReportWorkbook(report: ReportResponseDto, title: string) {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Aplicatie Concedii";
    wb.created = new Date();

    // 1) Sheet: Summary
    const summary = wb.addWorksheet("Summary");
    summary.columns = [
      { header: "Metric", key: "metric", width: 35 },
      { header: "Value", key: "value", width: 35 },
    ];

    summary.addRow({ metric: "Raport", value: title });
    summary.addRow({ metric: "Interval start", value: report.interval.start });
    summary.addRow({ metric: "Interval end", value: report.interval.end });
    summary.addRow({ metric: "Total cereri", value: report.totals.totalRequests });
    summary.addRow({ metric: "Zile solicitate (sum)", value: report.totals.daysRequested });
    summary.addRow({ metric: "Zile efective aprobate", value: report.totals.effectiveDaysApproved });
    summary.addRow({ metric: "Cereri întrerupte", value: report.totals.interruptedCount });

    summary.addRow({ metric: "", value: "" });

    const statusHeaderRow = summary.addRow({ metric: "Distribuție status", value: "" });
    Object.entries(report.totals.byStatus).forEach(([k, v]) => summary.addRow({ metric: k, value: v }));

    summary.addRow({ metric: "", value: "" });

    const typeHeaderRow = summary.addRow({ metric: "Distribuție tip", value: "" });
    Object.entries(report.totals.byType).forEach(([k, v]) => summary.addRow({ metric: k, value: v }));

    summary.getRow(1).font = { bold: true };
    statusHeaderRow.font = { bold: true };
    typeHeaderRow.font = { bold: true };

    // 2) Sheet: Requests (detaliat)
    const reqSheet = wb.addWorksheet("Requests");
    reqSheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Requester", key: "requesterName", width: 28 },
      { header: "Type", key: "type", width: 8 },
      { header: "Status", key: "status", width: 14 },
      { header: "Start", key: "startDate", width: 22 },
      { header: "End", key: "endDate", width: 22 },
      { header: "DaysCount", key: "daysCount", width: 10 },
      { header: "EffectiveDays", key: "effectiveDays", width: 12 },
      { header: "ApprovedBy", key: "approvedByName", width: 22 },
      { header: "InterruptedAt", key: "interruptedAt", width: 22 },
      { header: "InterruptedBy", key: "interruptedByName", width: 22 },
    ];

    report.rows.forEach((r) => {
      reqSheet.addRow({
        id: r.id,
        requesterName: r.requesterName ?? "",
        type: r.type,
        status: r.status,
        startDate: r.startDate,
        endDate: r.endDate,
        daysCount: r.daysCount,
        effectiveDays: r.effectiveDays,
        approvedByName: r.approvedByName ?? "",
        interruptedAt: r.interruptedAt ?? "",
        interruptedByName: r.interruptedByName ?? "",
      });
    });

    reqSheet.getRow(1).font = { bold: true };
    reqSheet.views = [{ state: "frozen", ySplit: 1 }];

    // 3) Sheet: Balances (sold)
    const balSheet = wb.addWorksheet("Balances");
    balSheet.columns = [
      { header: "UserId", key: "userId", width: 10 },
      { header: "Username", key: "username", width: 18 },
      { header: "FullName", key: "fullName", width: 28 },

      { header: "CO Annual", key: "coAnnual", width: 10 },
      { header: "CO Carryover", key: "coCarry", width: 12 },
      { header: "CO Used", key: "coUsed", width: 10 },
      { header: "CO Remaining", key: "coRem", width: 12 },

      { header: "COR Annual", key: "corAnnual", width: 10 },
      { header: "COR Carryover", key: "corCarry", width: 12 },
      { header: "COR Used", key: "corUsed", width: 10 },
      { header: "COR Remaining", key: "corRem", width: 12 },
    ];

    report.balances.forEach((b) => {
      balSheet.addRow({
        userId: b.userId,
        username: b.username ?? "",
        fullName: b.fullName ?? "",

        coAnnual: b.CO?.annualDays ?? 0,
        coCarry: b.CO?.carryoverDays ?? 0,
        coUsed: b.CO?.usedDays ?? 0,
        coRem: b.CO?.remainingDays ?? 0,

        corAnnual: b.COR?.annualDays ?? 0,
        corCarry: b.COR?.carryoverDays ?? 0,
        corUsed: b.COR?.usedDays ?? 0,
        corRem: b.COR?.remainingDays ?? 0,
      });
    });

    // totaluri sold pe ultimul rând
    balSheet.addRow({});
    const totalsRow = balSheet.addRow({
      userId: 0,
      username: "TOTAL",
      fullName: "",
      coAnnual: report.balancesTotals.CO?.annualDays ?? 0,
      coCarry: report.balancesTotals.CO?.carryoverDays ?? 0,
      coUsed: report.balancesTotals.CO?.usedDays ?? 0,
      coRem: report.balancesTotals.CO?.remainingDays ?? 0,
      corAnnual: report.balancesTotals.COR?.annualDays ?? 0,
      corCarry: report.balancesTotals.COR?.carryoverDays ?? 0,
      corUsed: report.balancesTotals.COR?.usedDays ?? 0,
      corRem: report.balancesTotals.COR?.remainingDays ?? 0,
    });

    balSheet.getRow(1).font = { bold: true };
    totalsRow.font = { bold: true };
    balSheet.views = [{ state: "frozen", ySplit: 1 }];

    return wb;
  }

  async buildMonthlyReportWorkbook(report: ReportResponseDto, year: number, month: number) {
    const title = `Monthly ${year}-${String(month).padStart(2, "0")}`;
    return this.buildReportWorkbook(report, title);
  }

  async buildYearlyReportWorkbook(report: ReportResponseDto, year: number) {
    const title = `Yearly ${year}`;
    return this.buildReportWorkbook(report, title);
  }

  async buildWeeklyReportWorkbook(report: ReportResponseDto, weekStartIso?: string) {
    const title = `Weekly ${weekStartIso ?? "current_week"}`;
    return this.buildReportWorkbook(report, title);
  }
}