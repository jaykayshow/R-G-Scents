import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { UpdateTrackingDto } from "./dto/update-tracking.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-orders")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN", "SUPPORT")
@Controller("admin/orders")
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  async list() {
    return this.orders.listAll();
  }

  @Get(":orderNumber")
  async getOne(@Param("orderNumber") orderNumber: string) {
    return this.orders.getByOrderNumberAdmin(orderNumber);
  }

  @Patch(":orderNumber/status")
  async updateStatus(
    @Param("orderNumber") orderNumber: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.orders.updateStatus(orderNumber, dto, { id: admin.id, name: admin.name });
  }

  @Patch(":orderNumber/tracking")
  async updateTracking(
    @Param("orderNumber") orderNumber: string,
    @Body() dto: UpdateTrackingDto,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.orders.updateTracking(orderNumber, dto, { id: admin.id, name: admin.name });
  }
}
