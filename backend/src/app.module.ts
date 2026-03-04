import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { LeaveRequestsModule } from "./leave-requests/leave-requests.module";
import { ReportsModule } from "./reports/reports.module";
import { LeaveBalanceModule } from "./leave-balance/leave-balance.module";
import { UsersModule } from "./users/users.module"; 

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ încarcă .env
    PrismaModule,
    AuthModule,
    LeaveRequestsModule,
    ReportsModule,
    LeaveBalanceModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}