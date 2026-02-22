import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { LeaveRequestsService } from "./leave-requests.service";
import { CanApproveGuard } from "./can-approve.guard";

@Controller("leave-requests")
@UseGuards(AuthGuard("jwt"))
export class LeaveRequestsController {
  constructor(private svc: LeaveRequestsService) {}

  // Listare cu filtre + paginare
  @Get()
  list(@Req() req: any, @Query() query: any) {
    return this.svc.list(req.user, query);
  }

  @Post("draft")
  createDraft(
    @Req() req: any,
    @Body() dto: { type: "CO" | "COR"; startDate: string; endDate: string; daysCount: number; reason?: string }
  ) {
    return this.svc.createDraft(req.user.sub, dto);
  }

  @Post(":id/submit")
  submit(@Req() req: any, @Param("id", ParseIntPipe) id: number) {
    return this.svc.submit(req.user.sub, id);
  }

  // Aprobare: Director sau Director Adjunct doar dacă e înlocuitor
  @Post(":id/approve")
  @UseGuards(RolesGuard, CanApproveGuard)
  approve(@Req() req: any, @Param("id", ParseIntPipe) id: number) {
    return this.svc.approve(req.user.sub, id);
  }

  @Post(":id/reject")
  @UseGuards(RolesGuard, CanApproveGuard)
  reject(@Req() req: any, @Param("id", ParseIntPipe) id: number, @Body() body: { reason?: string }) {
    return this.svc.reject(req.user.sub, id, body?.reason);
  }

  // Întrerupere: Director / Director Adjunct / Șef structură / Secretariat
  @Post(":id/interrupt")
  @UseGuards(RolesGuard)
  @Roles("DIRECTOR", "DIRECTOR_ADJUNCT", "SEF_STRUCTURA", "SECRETARIAT")
  interrupt(@Req() req: any, @Param("id", ParseIntPipe) id: number, @Body() body: { reason?: string }) {
    return this.svc.interrupt(req.user.sub, id, body?.reason);
  }
}