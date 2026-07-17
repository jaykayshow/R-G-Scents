import { Module } from "@nestjs/common";
import { AdminAuthService } from "./admin-auth.service";
import { AdminAuthController } from "./admin-auth.controller";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";

@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminJwtGuard, AdminRolesGuard],
  exports: [AdminAuthService, AdminJwtGuard, AdminRolesGuard],
})
export class AdminAuthModule {}
