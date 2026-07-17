import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("admin-analytics")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN")
@Controller("admin/analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get()
  async overview() {
    return this.analytics.overview();
  }
}
