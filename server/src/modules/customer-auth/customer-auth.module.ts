import { Module } from "@nestjs/common";
import { CustomerAuthService } from "./customer-auth.service";
import { CustomerAuthController } from "./customer-auth.controller";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { OptionalCustomerJwtGuard } from "../../common/guards/optional-customer-jwt.guard";

@Module({
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, CustomerJwtGuard, OptionalCustomerJwtGuard],
  exports: [CustomerAuthService, CustomerJwtGuard, OptionalCustomerJwtGuard],
})
export class CustomerAuthModule {}
