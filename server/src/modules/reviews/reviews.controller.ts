import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  async listApproved() {
    return this.reviews.listApproved();
  }

  @ApiCookieAuth()
  @UseGuards(CustomerJwtGuard)
  @Post()
  async create(@Body() dto: CreateReviewDto, @CurrentUser() user: RequestUser) {
    return this.reviews.create(dto, user.id);
  }
}
