import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Request } from "express";
import { TokenService } from "../token/token.service";
import { CUSTOMER_ACCESS_TOKEN_SERVICE, CUSTOMER_ACCESS_COOKIE } from "../token/token.constants";

/**
 * Attaches request.user when a valid customer access token is present
 * (e.g. registered checkout) but never rejects the request — used on
 * endpoints that also support guest access (e.g. guest checkout).
 */
@Injectable()
export class OptionalCustomerJwtGuard implements CanActivate {
  constructor(
    @Inject(CUSTOMER_ACCESS_TOKEN_SERVICE) private readonly tokenService: TokenService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[CUSTOMER_ACCESS_COOKIE];

    if (token) {
      try {
        const payload = this.tokenService.verify<{ sub: string }>(token);
        (request as Request & { user?: { id: string } }).user = { id: payload.sub };
      } catch {
        // Invalid/expired token on an optional-auth route — proceed as guest.
      }
    }

    return true;
  }
}
