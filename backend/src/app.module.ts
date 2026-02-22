import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';
import { ReportsModule } from "./reports/reports.module";
import { LeaveBalanceModule } from "./leave-balance/leave-balance.module";

@Module({
  imports: [PrismaModule, AuthModule, LeaveRequestsModule, ReportsModule, LeaveBalanceModule],
  controllers: [AppController],
})
export class AppModule {}