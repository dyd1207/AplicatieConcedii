import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CanApproveGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user; // { sub, roles, ... }

    const roles: string[] = user?.roles || [];
    if (roles.includes("DIRECTOR")) return true;

    if (roles.includes("DIRECTOR_ADJUNCT")) {
      // Director Adjunct poate aproba DOAR dacă este înlocuitorul Directorului
      const director = await this.prisma.user.findUnique({
        where: { username: "director" },
        select: { substituteId: true },
      });

      if (director?.substituteId === user.sub) return true;
    }

    throw new ForbiddenException("Nu ai drepturi de aprobare.");
  }
}