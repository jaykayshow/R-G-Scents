import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AdminAuthService } from "./admin-auth.service";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";
import {
  ACCESS_TOKEN_MAX_AGE_MS,
  ADMIN_REFRESH_TOKEN_MAX_AGE_MS,
  accessCookieOptions,
} from "../../common/token/cookie.util";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "../../common/token/token.constants";

@ApiTags("admin-auth")
@Controller("admin/auth")
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(ADMIN_ACCESS_COOKIE, accessToken, accessCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
    res.cookie(ADMIN_REFRESH_COOKIE, refreshToken, accessCookieOptions(ADMIN_REFRESH_TOKEN_MAX_AGE_MS));
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: AdminLoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, ...result } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return result;
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.[ADMIN_REFRESH_COOKIE];
    const { accessToken, refreshToken, ...result } = await this.authService.refresh(rawRefreshToken);
    this.setAuthCookies(res, accessToken, refreshToken);
    return result;
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.[ADMIN_REFRESH_COOKIE];
    const result = await this.authService.logout(rawRefreshToken);
    res.clearCookie(ADMIN_ACCESS_COOKIE, { path: "/" });
    res.clearCookie(ADMIN_REFRESH_COOKIE, { path: "/" });
    return result;
  }

  @ApiCookieAuth()
  @UseGuards(AdminJwtGuard)
  @Get("me")
  async me(@CurrentAdmin() admin: RequestAdmin) {
    return this.authService.me(admin.id);
  }
}
