import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Get()
  list(@Query() query: any) {
    // opțional: poți adăuga filtre în query (q, isActive etc.)
    return this.svc.list(query);
  }

  @Patch(":id/substitute")
  setSubstitute(
    @Req() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { substituteId: number | null }
  ) {
    // dacă vrei restricție pe rol, o facem imediat (RolesGuard)
    return this.svc.setSubstitute(id, body?.substituteId ?? null);
  }
}