import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { BlogService } from "./blog.service";
import { CreateBlogPostDto, UpdateBlogPostDto } from "./dto/blog-post.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-blog")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR")
@Controller("admin/blog")
export class AdminBlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  async list() {
    return this.blog.listAllForAdmin();
  }

  @Post()
  async create(@Body() dto: CreateBlogPostDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.blog.create(dto, { id: admin.id, name: admin.name });
  }

  @Patch(":slug")
  async update(@Param("slug") slug: string, @Body() dto: UpdateBlogPostDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.blog.update(slug, dto, { id: admin.id, name: admin.name });
  }

  @Delete(":slug")
  async remove(@Param("slug") slug: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.blog.remove(slug, { id: admin.id, name: admin.name });
  }
}
