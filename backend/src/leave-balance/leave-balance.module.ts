import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { LeaveBalanceController } from "./leave-balance.controller";
import { LeaveBalanceService } from "./leave-balance.service";

@Module({
  imports: [PrismaModule],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
  exports: [LeaveBalanceService], // important: îl folosim în LeaveRequestService
})
export class LeaveBalanceModule {}