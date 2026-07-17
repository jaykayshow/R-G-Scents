import { Module } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { BlogController } from "./blog.controller";
import { AdminBlogController } from "./admin-blog.controller";
import { BannersService } from "./banners.service";
import { BannersController } from "./banners.controller";
import { AdminBannersController } from "./admin-banners.controller";
import { SettingsService } from "./settings.service";
import { SettingsController } from "./settings.controller";
import { AdminSettingsController } from "./admin-settings.controller";
import { NewsletterService } from "./newsletter.service";
import { NewsletterController } from "./newsletter.controller";

@Module({
  controllers: [
    BlogController,
    AdminBlogController,
    BannersController,
    AdminBannersController,
    SettingsController,
    AdminSettingsController,
    NewsletterController,
  ],
  providers: [BlogService, BannersService, SettingsService, NewsletterService],
})
export class ContentModule {}
