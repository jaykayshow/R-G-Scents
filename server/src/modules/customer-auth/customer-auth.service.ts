import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { TokenService } from "../../common/token/token.service";
import { generateRawToken, hashToken } from "../../common/token/hash.util";
import {
  CUSTOMER_ACCESS_TOKEN_SERVICE,
  CUSTOMER_REFRESH_TOKEN_SERVICE,
} from "../../common/token/token.constants";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ResendVerificationDto, VerifyEmailDto } from "./dto/verify-email.dto";
import { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30d

function generateReferralCode(firstName: string): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${firstName.replace(/[^a-zA-Z]/g, "").toUpperCase() || "RG"}-${suffix}`;
}

function sanitizeUser<T extends { passwordHash: string }>(user: T) {
  const { passwordHash: _passwordHash, ...rest } = user;
  void _passwordHash;
  return rest;
}

@Injectable()
export class CustomerAuthService {
  private readonly isDev: boolean;
  private readonly saltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly auditLog: AuditLogService,
    @Inject(CUSTOMER_ACCESS_TOKEN_SERVICE) private readonly accessTokens: TokenService,
    @Inject(CUSTOMER_REFRESH_TOKEN_SERVICE) private readonly refreshTokens: TokenService
  ) {
    this.isDev = config.get("NODE_ENV") !== "production";
    this.saltRounds = Number(config.get("BCRYPT_SALT_ROUNDS") ?? 12);
  }

  private async issueTokenPair(userId: string) {
    const accessToken = this.accessTokens.sign({ sub: userId });
    const refreshToken = this.refreshTokens.sign({ sub: userId });

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return { accessToken, refreshToken };
  }

  private logMockEmail(to: string, subject: string, body: string) {
    // eslint-disable-next-line no-console
    console.log(`\n--- [MOCK EMAIL] ---\nTo: ${to}\nSubject: ${subject}\n${body}\n--------------------\n`);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        passwordHash,
        referralCode: generateReferralCode(dto.firstName),
      },
    });

    const rawToken = generateRawToken();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      },
    });

    this.logMockEmail(
      user.email,
      "Verify your R&G Scents account",
      `Click to verify: http://localhost:3000/auth/verify-email?token=${rawToken}`
    );

    const tokens = await this.issueTokenPair(user.id);

    await this.auditLog.log({
      actorName: `${user.firstName} ${user.lastName}`,
      action: "Customer registered",
      target: user.email,
      category: "CUSTOMER",
    });

    return {
      user: sanitizeUser(user),
      ...tokens,
      ...(this.isDev ? { devVerificationToken: rawToken } : {}),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    if (user.status === "SUSPENDED") {
      throw new UnauthorizedException("This account has been suspended.");
    }

    const tokens = await this.issueTokenPair(user.id);

    await this.auditLog.log({
      actorName: `${user.firstName} ${user.lastName}`,
      action: "Customer logged in",
      target: user.email,
      category: "CUSTOMER",
    });

    return { user: sanitizeUser(user), ...tokens };
  }

  async refresh(rawRefreshToken: string) {
    let payload: { sub: string };
    try {
      payload = this.refreshTokens.verify<{ sub: string }>(rawRefreshToken);
    } catch {
      throw new UnauthorizedException("Session expired. Please sign in again.");
    }

    const tokenHash = hashToken(rawRefreshToken);
    const record = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!record || record.revoked || record.expiresAt < new Date() || record.userId !== payload.sub) {
      throw new UnauthorizedException("Session expired. Please sign in again.");
    }

    await this.prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });
    const tokens = await this.issueTokenPair(payload.sub);

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException("Account no longer exists.");

    return { user: sanitizeUser(user), ...tokens };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      const record = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });
      await this.prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });

      if (record) {
        await this.auditLog.log({
          actorName: `${record.user.firstName} ${record.user.lastName}`,
          action: "Customer logged out",
          target: record.user.email,
          category: "CUSTOMER",
        });
      }
    }
    return { message: "Signed out." };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("Account no longer exists.");
    return sanitizeUser(user);
  }

  async updateNotificationPreferences(userId: string, dto: UpdateNotificationPreferencesDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: dto });
    return sanitizeUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (existing && existing.id !== userId) {
        throw new ConflictException("An account with this email already exists.");
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { ...dto, email: dto.email ? dto.email.toLowerCase() : undefined },
    });

    await this.auditLog.log({
      actorName: `${user.firstName} ${user.lastName}`,
      action: "Updated profile",
      target: user.email,
      category: "CUSTOMER",
    });

    return sanitizeUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("Account no longer exists.");

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestException("Current password is incorrect.");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
    ]);

    await this.auditLog.log({
      actorName: `${user.firstName} ${user.lastName}`,
      action: "Changed password",
      target: user.email,
      category: "CUSTOMER",
    });

    return { message: "Password updated successfully." };
  }

  async deleteAccount(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("Account no longer exists.");

    const anonymizedEmail = `deleted-${userId}@rgscents.invalid`;
    const unusableHash = await bcrypt.hash(generateRawToken(), this.saltRounds);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          firstName: "Deleted",
          lastName: "User",
          email: anonymizedEmail,
          phone: null,
          passwordHash: unusableHash,
          status: "SUSPENDED",
          adminNotes: "Account deleted by customer request.",
        },
      }),
      this.prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } }),
    ]);

    await this.auditLog.log({
      actorName: `${user.firstName} ${user.lastName}`,
      action: "Deleted account",
      target: user.email,
      category: "CUSTOMER",
    });

    return { message: "Your account has been deleted." };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });

    if (user) {
      const rawToken = generateRawToken();
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });
      this.logMockEmail(
        user.email,
        "Reset your R&G Scents password",
        `Click to reset: http://localhost:3000/auth/reset-password?token=${rawToken}`
      );
      return {
        message: "If an account exists for this email, a reset link has been sent.",
        ...(this.isDev ? { devResetToken: rawToken } : {}),
      };
    }

    return { message: "If an account exists for this email, a reset link has been sent." };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException("This reset link is invalid or has expired.");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, this.saltRounds);

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshToken.updateMany({ where: { userId: record.userId }, data: { revoked: true } }),
    ]);

    return { message: "Password updated successfully." };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = hashToken(dto.token);
    const record = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException("This verification link is invalid or has expired.");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
      this.prisma.emailVerificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    ]);

    return { message: "Email verified successfully." };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!user || user.emailVerified) {
      return { message: "If this account needs verification, a new email has been sent." };
    }

    const rawToken = generateRawToken();
    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      },
    });
    this.logMockEmail(
      user.email,
      "Verify your R&G Scents account",
      `Click to verify: http://localhost:3000/auth/verify-email?token=${rawToken}`
    );

    return {
      message: "If this account needs verification, a new email has been sent.",
      ...(this.isDev ? { devVerificationToken: rawToken } : {}),
    };
  }
}
