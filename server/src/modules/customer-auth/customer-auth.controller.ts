import { Body, Controller, Delete, Get, HttpCode, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { ApiCookieAuth } from "@nestjs/swagger";
import { CustomerAuthService } from "./customer-auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ResendVerificationDto, VerifyEmailDto } from "./dto/verify-email.dto";
import { UpdateNotificationPreferencesDto } from "./dto/update-notification-preferences.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";
import {
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
  accessCookieOptions,
} from "../../common/token/cookie.util";
import { CUSTOMER_ACCESS_COOKIE, CUSTOMER_REFRESH_COOKIE } from "../../common/token/token.constants";

@ApiTags("customer-auth")
@Controller("auth")
export class CustomerAuthController {
  constructor(private readonly authService: CustomerAuthService) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(CUSTOMER_ACCESS_COOKIE, accessToken, accessCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
    res.cookie(CUSTOMER_REFRESH_COOKIE, refreshToken, accessCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));
  }

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, ...result } = await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return result;
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, ...result } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return result;
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.[CUSTOMER_REFRESH_COOKIE];
    const { accessToken, refreshToken, ...result } = await this.authService.refresh(rawRefreshToken);
    this.setAuthCookies(res, accessToken, refreshToken);
    return result;
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.[CUSTOMER_REFRESH_COOKIE];
    const result = await this.authService.logout(rawRefreshToken);
    res.clearCookie(CUSTOMER_ACCESS_COOKIE, { path: "/" });
    res.clearCookie(CUSTOMER_REFRESH_COOKIE, { path: "/" });
    return result;
  }

  @ApiCookieAuth()
  @UseGuards(CustomerJwtGuard)
  @Get("me")
  async me(@CurrentUser() user: RequestUser) {
    return this.authService.me(user.id);
  }

  @ApiCookieAuth()
  @UseGuards(CustomerJwtGuard)
  @Patch("notification-preferences")
  async updateNotificationPreferences(
    @Body() dto: UpdateNotificationPreferencesDto,
    @CurrentUser() user: RequestUser
  ) {
    return this.authService.updateNotificationPreferences(user.id, dto);
  }

  @ApiCookieAuth()
  @UseGuards(CustomerJwtGuard)
  @Patch("profile")
  async updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser() user: RequestUser) {
    return this.authService.updateProfile(user.id, dto);
  }

  @ApiCookieAuth()
  @UseGuards(CustomerJwtGuard)
  @Patch("password")
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: RequestUser) {
    return this.authService.changePassword(user.id, dto);
  }

  @ApiCookieAuth()
  @UseGuards(CustomerJwtGuard)
  @Delete("account")
  async deleteAccount(@CurrentUser() user: RequestUser, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.deleteAccount(user.id);
    res.clearCookie(CUSTOMER_ACCESS_COOKIE, { path: "/" });
    res.clearCookie(CUSTOMER_REFRESH_COOKIE, { path: "/" });
    return result;
  }

  @Post("forgot-password")
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post("verify-email")
  @HttpCode(200)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post("resend-verification")
  @HttpCode(200)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }
}
