import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CouponsService } from "./coupons.service";
import { ValidateCouponDto } from "./dto/validate-coupon.dto";

@ApiTags("coupons")
@Controller("coupons")
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Post("validate")
  async validate(@Body() dto: ValidateCouponDto) {
    return this.coupons.validateCoupon(dto.code, dto.subtotal);
  }
}
