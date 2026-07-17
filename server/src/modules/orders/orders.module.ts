import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { AdminOrdersController } from "./admin-orders.controller";
import { CouponsModule } from "../coupons/coupons.module";

@Module({
  imports: [CouponsModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
