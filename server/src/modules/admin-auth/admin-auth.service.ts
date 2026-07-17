import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { TokenService } from "../../common/token/token.service";
import { hashToken } from "../../common/token/hash.util";
import { ADMIN_ACCESS_TOKEN_SERVICE, ADMIN_REFRESH_TOKEN_SERVICE } from "../../common/token/token.constants";
import { AdminLoginDto } from "./dto/admin-login.dto";

const ADMIN_REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7d

function sanitizeAdmin<T extends { passwordHash: string }>(admin: T) {
  const { passwordHash: _passwordHash, ...rest } = admin;
  void _passwordHash;
  return rest;
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditLog: AuditLogService,
    @Inject(ADMIN_ACCESS_TOKEN_SERVICE) private readonly accessTokens: TokenService,
    @Inject(ADMIN_REFRESH_TOKEN_SERVICE) private readonly refreshTokens: TokenService
  ) {}

  private async issueTokenPair(adminUserId: string, role: string, name: string) {
    const accessToken = this.accessTokens.sign({ sub: adminUserId, role, name });
    const refreshToken = this.refreshTokens.sign({ sub: adminUserId, role, name });

    await this.prisma.adminRefreshToken.create({
      data: {
        adminUserId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + ADMIN_REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  async login(dto: AdminLoginDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { role: true },
    });

    if (!admin) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const valid = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (!admin.active) {
      throw new UnauthorizedException("This admin account has been deactivated.");
    }

    await this.prisma.adminUser.update({ where: { id: admin.id }, data: { lastLogin: new Date() } });

    const tokens = await this.issueTokenPair(admin.id, admin.role.name, admin.name);

    await this.auditLog.log({
      actorId: admin.id,
      actorName: admin.name,
      action: "Admin logged in",
      target: admin.email,
      category: "USER",
    });

    return { admin: { ...sanitizeAdmin(admin), role: admin.role.name }, ...tokens };
  }

  async refresh(rawRefreshToken: string) {
    let payload: { sub: string; role: string };
    try {
      payload = this.refreshTokens.verify<{ sub: string; role: string }>(rawRefreshToken);
    } catch {
      throw new UnauthorizedException("Session expired. Please sign in again.");
    }

    const tokenHash = hashToken(rawRefreshToken);
    const record = await this.prisma.adminRefreshToken.findUnique({ where: { tokenHash } });
    if (!record || record.revoked || record.expiresAt < new Date() || record.adminUserId !== payload.sub) {
      throw new UnauthorizedException("Session expired. Please sign in again.");
    }

    await this.prisma.adminRefreshToken.update({ where: { id: record.id }, data: { revoked: true } });

    const admin = await this.prisma.adminUser.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });
    if (!admin || !admin.active) throw new UnauthorizedException("Account no longer active.");

    const tokens = await this.issueTokenPair(admin.id, admin.role.name, admin.name);
    return { admin: { ...sanitizeAdmin(admin), role: admin.role.name }, ...tokens };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const record = await this.prisma.adminRefreshToken.findUnique({
        where: { tokenHash },
        include: { adminUser: true },
      });
      await this.prisma.adminRefreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });

      if (record) {
        await this.auditLog.log({
          actorId: record.adminUser.id,
          actorName: record.adminUser.name,
          action: "Admin logged out",
          target: record.adminUser.email,
          category: "USER",
        });
      }
    }
    return { message: "Signed out." };
  }

  async me(adminUserId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: adminUserId },
      include: { role: true },
    });
    if (!admin) throw new UnauthorizedException("Account no longer exists.");
    return { ...sanitizeAdmin(admin), role: admin.role.name };
  }
}
