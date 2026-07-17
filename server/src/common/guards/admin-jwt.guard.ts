import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { AdminRole } from "@prisma/client";
import { TokenService } from "../token/token.service";
import { ADMIN_ACCESS_TOKEN_SERVICE, ADMIN_ACCESS_COOKIE } from "../token/token.constants";

@Injectable()
export class AdminJwtGuard implements CanActivate {
  constructor(
    @Inject(ADMIN_ACCESS_TOKEN_SERVICE) private readonly tokenService: TokenService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[ADMIN_ACCESS_COOKIE];

    if (!token) {
      throw new UnauthorizedException("Not authenticated.");
    }

    try {
      const payload = this.tokenService.verify<{ sub: string; role: AdminRole; name: string }>(token);
      (request as Request & { admin: { id: string; role: AdminRole; name: string } }).admin = {
        id: payload.sub,
        role: payload.role,
        name: payload.name,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Session expired or invalid.");
    }
  }
}
