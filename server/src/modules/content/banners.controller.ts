import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BannersService } from "./banners.service";

@ApiTags("banners")
@Controller("banners")
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  async list() {
    return this.banners.list();
  }
}
