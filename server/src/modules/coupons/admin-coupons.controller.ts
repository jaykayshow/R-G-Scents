import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { CouponsService } from "./coupons.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-coupons")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN")
@Controller("admin/coupons")
export class AdminCouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get()
  async list() {
    return this.coupons.list();
  }

  @Post()
  async create(@Body() dto: CreateCouponDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.coupons.create(dto, { id: admin.id, name: admin.name });
  }

  @Patch(":code")
  async update(@Param("code") code: string, @Body() dto: UpdateCouponDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.coupons.update(code, dto, { id: admin.id, name: admin.name });
  }

  @Delete(":code")
  async delete(@Param("code") code: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.coupons.delete(code, { id: admin.id, name: admin.name });
  }
}
