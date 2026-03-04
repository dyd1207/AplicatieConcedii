import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async list(query: any) {
    const q = (query?.q || "").toString().trim();

    const where: any = {};
    if (q) {
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { fullName: "asc" },
      include: {
        substitute: { select: { id: true, fullName: true, username: true, email: true } },
        roles: { include: { role: true } },
      },
    });

    // returnăm shape “prietenos” pentru frontend
    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      isActive: u.isActive,
      substituteId: u.substituteId,
      substitute: u.substitute,
      roles: (u.roles || []).map((ur) => ur.role.code), // ex: ["SECRETARIAT", "DIRECTOR_ADJUNCT"]
    }));
  }

  async setSubstitute(userId: number, substituteId: number | null) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Utilizator inexistent.");

    if (substituteId === userId) {
      throw new BadRequestException("Un utilizator nu poate fi înlocuitor pentru el însuși.");
    }

    if (substituteId !== null) {
      const sub = await this.prisma.user.findUnique({ where: { id: substituteId } });
      if (!sub) throw new NotFoundException("Înlocuitorul selectat nu există.");
      if (!sub.isActive) throw new BadRequestException("Înlocuitorul selectat este inactiv.");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { substituteId },
      select: { id: true, substituteId: true },
    });
  }
}