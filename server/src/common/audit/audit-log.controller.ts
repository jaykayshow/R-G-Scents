import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { AuditLogService } from "./audit-log.service";
import { AdminJwtGuard } from "../guards/admin-jwt.guard";
import { AdminRolesGuard } from "../guards/admin-roles.guard";
import { Roles } from "../decorators/roles.decorator";

@ApiTags("admin-audit-logs")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN")
@Controller("admin/audit-logs")
export class AuditLogController {
  constructor(private readonly auditLog: AuditLogService) {}

  @Get()
  async list() {
    return this.auditLog.list();
  }
}
