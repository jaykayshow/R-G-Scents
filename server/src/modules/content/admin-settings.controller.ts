import { Body, Controller, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-settings")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN")
@Controller("admin/settings")
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Patch()
  async update(
    @Body() dto: UpdateSettingsDto,
    @Query("section") section: string | undefined,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.settings.update(dto, { id: admin.id, name: admin.name }, section ?? "Settings");
  }
}
