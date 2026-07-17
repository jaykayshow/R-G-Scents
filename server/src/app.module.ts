import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./common/prisma/prisma.module";
import { RedisModule } from "./common/redis/redis.module";
import { TokenModule } from "./common/token/token.module";
import { AuditLogModule } from "./common/audit/audit-log.module";
import { CustomerAuthModule } from "./modules/customer-auth/customer-auth.module";
import { AdminAuthModule } from "./modules/admin-auth/admin-auth.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CouponsModule } from "./modules/coupons/coupons.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { WishlistModule } from "./modules/wishlist/wishlist.module";
import { AddressesModule } from "./modules/addresses/addresses.module";
import { SupportModule } from "./modules/support/support.module";
import { RewardsModule } from "./modules/rewards/rewards.module";
import { ContentModule } from "./modules/content/content.module";
import { AdminUsersModule } from "./modules/admin-users/admin-users.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    TokenModule,
    AuditLogModule,
    CustomerAuthModule,
    AdminAuthModule,
    CatalogModule,
    CouponsModule,
    OrdersModule,
    ReviewsModule,
    WishlistModule,
    AddressesModule,
    SupportModule,
    RewardsModule,
    ContentModule,
    AdminUsersModule,
    CustomersModule,
    AnalyticsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
