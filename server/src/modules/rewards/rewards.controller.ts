import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { RewardsService } from "./rewards.service";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("rewards")
@ApiCookieAuth()
@UseGuards(CustomerJwtGuard)
@Controller()
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}

  @Get("rewards/transactions")
  async transactions(@CurrentUser() user: RequestUser) {
    return this.rewards.transactions(user.id);
  }

  @Get("referrals")
  async referrals(@CurrentUser() user: RequestUser) {
    return this.rewards.referrals(user.id);
  }
}
