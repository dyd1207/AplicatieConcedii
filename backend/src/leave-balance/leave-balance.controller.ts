import { Controller, Get, Param, ParseIntPipe, Put, Body, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { LeaveBalanceService } from "./leave-balance.service";
import { GetBalanceQueryDto } from "./dto/get-balance-query.dto";
import { UpsertEntitlementDto } from "./dto/upsert-entitlement.dto";

@Controller("leave-balance")
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class LeaveBalanceController {
  constructor(private readonly leaveBalanceService: LeaveBalanceService) {}

  @Get("me")
  @Roles("ANGAJAT", "SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  async me(@Req() req: Request, @Query() query: GetBalanceQueryDto) {
    const user = req.user as any;
    const year = query.year ?? new Date().getFullYear();
    return this.leaveBalanceService.getUserBalance(user.id, year);
  }

  @Get(":userId")
  @Roles("SECRETARIAT", "SEF_STRUCTURA", "DIRECTOR_ADJUNCT", "DIRECTOR", "ADMINISTRATOR")
  async byUser(@Param("userId", ParseIntPipe) userId: number, @Query() query: GetBalanceQueryDto) {
    const year = query.year ?? new Date().getFullYear();
    return this.leaveBalanceService.getUserBalance(userId, year);
  }

  @Put(":userId")
  @Roles("SECRETARIAT", "ADMINISTRATOR")
  async upsert(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() dto: UpsertEntitlementDto
  ) {
    await this.leaveBalanceService.upsertEntitlement(userId, dto);
    return { message: "Drepturile au fost salvate." };
  }
}