import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { WishlistService } from "./wishlist.service";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("wishlist")
@ApiCookieAuth()
@UseGuards(CustomerJwtGuard)
@Controller("wishlist")
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return this.wishlist.list(user.id);
  }

  @Post(":productId")
  async add(@Param("productId") productId: string, @CurrentUser() user: RequestUser) {
    return this.wishlist.add(user.id, productId);
  }

  @Delete(":productId")
  async remove(@Param("productId") productId: string, @CurrentUser() user: RequestUser) {
    return this.wishlist.remove(user.id, productId);
  }
}
