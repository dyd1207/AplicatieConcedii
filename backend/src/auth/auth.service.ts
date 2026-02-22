import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) throw new UnauthorizedException("Credențiale invalide.");

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException("Credențiale invalide.");

    const roleCodes = user.roles.map((ur) => ur.role.code);

    const payload = {
      sub: user.id,
      username: user.username,
      roles: roleCodes,
    };

    return {
      accessToken: await this.jwt.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        roles: roleCodes,
      },
    };
  }
}