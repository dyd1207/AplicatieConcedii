import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LeaveRequestsModule } from './leave-requests/leave-requests.module';

@Module({
  imports: [PrismaModule, AuthModule, LeaveRequestsModule],
  controllers: [AppController],
})
export class AppModule {}