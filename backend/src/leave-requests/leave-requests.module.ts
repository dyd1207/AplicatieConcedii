import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LeaveBalanceModule } from "../leave-balance/leave-balance.module";
import { LeaveRequestsController } from "./leave-requests.controller";
import { LeaveRequestsService } from "./leave-requests.service";

@Module({
  imports: [PrismaModule, LeaveBalanceModule],
  controllers: [LeaveRequestsController],
  providers: [LeaveRequestsService],
})
export class LeaveRequestsModule {}