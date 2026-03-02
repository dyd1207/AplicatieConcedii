import { Injectable, UnauthorizedException, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(username: string, password: string) {
    // 1) Validare input (evită undefined -> erori Prisma/bcrypt)
    if (!username || typeof username !== "string") {
      throw new BadRequestException("Câmpul 'username' este obligatoriu.");
    }
    if (!password || typeof password !== "string") {
      throw new BadRequestException("Câmpul 'password' este obligatoriu.");
    }

    // 2) Caută user
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { roles: { include: { role: true } } },
    });

    // 3) Dacă nu există / e inactiv -> 401 (nu 500)
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Credențiale invalide.");
    }

    // 4) Siguranță: parola în DB trebuie să existe
    if (!user.password || typeof user.password !== "string") {
      // user în DB fără parolă hashuită -> e problemă de date
      throw new InternalServerErrorException("Utilizator invalid: parolă lipsă în baza de date.");
    }

    // 5) Verifică parola
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException("Credențiale invalide.");
    }

    // 6) Roluri (siguranță la null)
    const roleCodes = (user.roles || [])
      .map((ur) => ur?.role?.code)
      .filter((code): code is string => typeof code === "string" && code.length > 0);

    // 7) Token
    const payload = {
      sub: user.id,
      username: user.username,
      roles: roleCodes,
    };

    let accessToken: string;
    try {
      accessToken = await this.jwt.signAsync(payload);
    } catch (e) {
      // de obicei JWT_SECRET lipsă / config greșit
      throw new InternalServerErrorException("Eroare la generarea token-ului (verifică JWT_SECRET).");
    }

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        roles: roleCodes,
      },
    };
  }
}