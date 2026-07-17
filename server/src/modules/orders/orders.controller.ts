import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { OptionalCustomerJwtGuard } from "../../common/guards/optional-customer-jwt.guard";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @UseGuards(OptionalCustomerJwtGuard)
  @Post()
  async create(@Body() dto: CreateOrderDto, @Req() req: Request) {
    const user = (req as Request & { user?: RequestUser }).user;
    return this.orders.createOrder(dto, user?.id);
  }

  @ApiCookieAuth()
  @UseGuards(CustomerJwtGuard)
  @Get()
  async listMine(@CurrentUser() user: RequestUser) {
    return this.orders.listForUser(user.id);
  }

  @UseGuards(OptionalCustomerJwtGuard)
  @Get(":orderNumber")
  async getOne(@Param("orderNumber") orderNumber: string, @Req() req: Request) {
    const user = (req as Request & { user?: RequestUser }).user;
    return this.orders.getByOrderNumber(orderNumber, user?.id);
  }
}
