import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { AddressesService } from "./addresses.service";
import { CreateAddressDto, UpdateAddressDto } from "./dto/address.dto";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("addresses")
@ApiCookieAuth()
@UseGuards(CustomerJwtGuard)
@Controller("addresses")
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return this.addresses.list(user.id);
  }

  @Post()
  async create(@Body() dto: CreateAddressDto, @CurrentUser() user: RequestUser) {
    return this.addresses.create(user.id, dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateAddressDto, @CurrentUser() user: RequestUser) {
    return this.addresses.update(user.id, id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.addresses.remove(user.id, id);
  }

  @Patch(":id/default")
  async setDefault(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.addresses.setDefault(user.id, id);
  }
}
