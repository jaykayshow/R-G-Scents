import { Body, Controller, Delete, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { BannersService } from "./banners.service";
import { CreateBannerDto, UpdateBannerDto } from "./dto/banner.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-banners")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR")
@Controller("admin/banners")
export class AdminBannersController {
  constructor(private readonly banners: BannersService) {}

  @Post()
  async create(@Body() dto: CreateBannerDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.banners.create(dto, { id: admin.id, name: admin.name });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateBannerDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.banners.update(id, dto, { id: admin.id, name: admin.name });
  }

  @Patch(":id/toggle")
  async toggleActive(@Param("id") id: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.banners.toggleActive(id, { id: admin.id, name: admin.name });
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.banners.remove(id, { id: admin.id, name: admin.name });
  }
}
