import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { CustomersService } from "./customers.service";
import { UpdateNotesDto } from "./dto/update-notes.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-customers")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN", "SUPPORT")
@Controller("admin/customers")
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  async list() {
    return this.customers.list();
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.customers.getOne(id);
  }

  @Patch(":id/status")
  async toggleStatus(@Param("id") id: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.customers.toggleStatus(id, { id: admin.id, name: admin.name });
  }

  @Patch(":id/notes")
  async updateNotes(@Param("id") id: string, @Body() dto: UpdateNotesDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.customers.updateNotes(id, dto, { id: admin.id, name: admin.name });
  }
}
