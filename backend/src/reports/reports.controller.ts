import { Controller, Get, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ReportsService } from "./reports.service";
import { WeeklyReportQueryDto, MonthlyReportQueryDto, YearlyReportQueryDto } from "./dto/report-query.dto";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ReportsExcelService } from "./reports-excel.service";

@Controller("reports")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly reportsExcelService: ReportsExcelService
  ) {}

  @Get("weekly")
  @Roles("ANGAJAT", "SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  weekly(@Query() query: WeeklyReportQueryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.reportsService.weekly({ weekStart: query.weekStart, user });
  }

  @Get("monthly")
  @Roles("ANGAJAT", "SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  monthly(@Query() query: MonthlyReportQueryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.reportsService.monthly({ year: query.year, month: query.month, user });
  }

  @Get("yearly")
  @Roles("ANGAJAT", "SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  yearly(@Query() query: YearlyReportQueryDto, @Req() req: Request) {
    const user = req.user as any;
    return this.reportsService.yearly({ year: query.year, user });
  }

  // ✅ Export Excel (Monthly)
  @Get("monthly/excel")
  @Roles("ANGAJAT", "SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  async monthlyExcel(
    @Query() query: MonthlyReportQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const user = req.user as any;

    const report = await this.reportsService.monthly({
      year: query.year,
      month: query.month,
      user,
    });

    const wb = await this.reportsExcelService.buildMonthlyReportWorkbook(report, query.year, query.month);

    const filename = `report_monthly_${query.year}_${String(query.month).padStart(2, "0")}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await wb.xlsx.write(res);
    res.end();
  }
  @Get("weekly/excel")
  @Roles("ANGAJAT", "SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  async weeklyExcel(
    @Query() query: WeeklyReportQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const user = req.user as any;

    const report = await this.reportsService.weekly({
      weekStart: query.weekStart,
      user,
    });

    const wb = await this.reportsExcelService.buildWeeklyReportWorkbook(report, query.weekStart);

    const weekStart = query.weekStart ?? "current_week";
    const filename = `report_weekly_${weekStart}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await wb.xlsx.write(res);
    res.end();
  }
  @Get("yearly/excel")
  @Roles("ANGAJAT", "SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  async yearlyExcel(
    @Query() query: YearlyReportQueryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const user = req.user as any;

    const report = await this.reportsService.yearly({
      year: query.year,
      user,
    });

    const wb = await this.reportsExcelService.buildYearlyReportWorkbook(report, query.year);

    const filename = `report_yearly_${query.year}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await wb.xlsx.write(res);
    res.end();
  }
}