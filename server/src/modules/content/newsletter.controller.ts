import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { NewsletterService } from "./newsletter.service";
import { SubscribeNewsletterDto } from "./dto/subscribe-newsletter.dto";
import { OptionalCustomerJwtGuard } from "../../common/guards/optional-customer-jwt.guard";
import { RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("newsletter")
@UseGuards(OptionalCustomerJwtGuard)
@Controller("newsletter")
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post("subscribe")
  async subscribe(@Body() dto: SubscribeNewsletterDto, @Req() req: Request) {
    const user = (req as Request & { user?: RequestUser }).user;
    return this.newsletter.subscribe(dto.email, user?.id);
  }
}
