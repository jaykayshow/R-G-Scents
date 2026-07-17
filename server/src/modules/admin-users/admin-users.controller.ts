import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { AdminUsersService } from "./admin-users.service";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";
import { UpdateAdminUserDto } from "./dto/update-admin-user.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-users")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN")
@Controller("admin/users")
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  async list() {
    return this.adminUsers.list();
  }

  @Post()
  async create(@Body() dto: CreateAdminUserDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.adminUsers.create(dto, { id: admin.id, name: admin.name });
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateAdminUserDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.adminUsers.update(id, dto, { id: admin.id, name: admin.name });
  }

  @Patch(":id/toggle")
  async toggleActive(@Param("id") id: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.adminUsers.toggleActive(id, { id: admin.id, name: admin.name });
  }
}
