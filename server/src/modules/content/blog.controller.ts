import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BlogService } from "./blog.service";

@ApiTags("blog")
@Controller("blog")
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  async list() {
    return this.blog.listPublished();
  }

  @Get(":slug")
  async getOne(@Param("slug") slug: string) {
    return this.blog.getPublishedBySlug(slug);
  }
}
