import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { ReviewsService } from "./reviews.service";
import { UpdateReviewStatusDto } from "./dto/update-review-status.dto";
import { ReplyReviewDto } from "./dto/reply-review.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-reviews")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN", "SUPPORT", "CONTENT_EDITOR")
@Controller("admin/reviews")
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  async list() {
    return this.reviews.listAllForAdmin();
  }

  @Patch(":id/status")
  async updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateReviewStatusDto,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.reviews.updateStatus(id, dto, { id: admin.id, name: admin.name });
  }

  @Post(":id/reply")
  async reply(@Param("id") id: string, @Body() dto: ReplyReviewDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.reviews.reply(id, dto, { id: admin.id, name: admin.name });
  }
}
