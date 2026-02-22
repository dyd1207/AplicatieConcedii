import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ReportsService } from "./reports.service";
import { WeeklyReportQueryDto, MonthlyReportQueryDto, YearlyReportQueryDto } from "./dto/report-query.dto";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller("reports")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

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
}