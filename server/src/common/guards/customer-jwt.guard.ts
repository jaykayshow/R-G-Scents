import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { TokenService } from "../token/token.service";
import { CUSTOMER_ACCESS_TOKEN_SERVICE, CUSTOMER_ACCESS_COOKIE } from "../token/token.constants";

@Injectable()
export class CustomerJwtGuard implements CanActivate {
  constructor(
    @Inject(CUSTOMER_ACCESS_TOKEN_SERVICE) private readonly tokenService: TokenService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[CUSTOMER_ACCESS_COOKIE];

    if (!token) {
      throw new UnauthorizedException("Not authenticated.");
    }

    try {
      const payload = this.tokenService.verify<{ sub: string }>(token);
      (request as Request & { user: { id: string } }).user = { id: payload.sub };
      return true;
    } catch {
      throw new UnauthorizedException("Session expired or invalid.");
    }
  }
}
