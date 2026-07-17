import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TokenService } from "./token.service";
import {
  ADMIN_ACCESS_TOKEN_SERVICE,
  ADMIN_REFRESH_TOKEN_SERVICE,
  CUSTOMER_ACCESS_TOKEN_SERVICE,
  CUSTOMER_REFRESH_TOKEN_SERVICE,
} from "./token.constants";

@Global()
@Module({
  providers: [
    {
      provide: CUSTOMER_ACCESS_TOKEN_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new TokenService(
          config.getOrThrow<string>("JWT_CUSTOMER_ACCESS_SECRET"),
          config.get<string>("JWT_CUSTOMER_ACCESS_TTL") ?? "15m"
        ),
    },
    {
      provide: CUSTOMER_REFRESH_TOKEN_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new TokenService(
          config.getOrThrow<string>("JWT_CUSTOMER_REFRESH_SECRET"),
          config.get<string>("JWT_CUSTOMER_REFRESH_TTL") ?? "30d"
        ),
    },
    {
      provide: ADMIN_ACCESS_TOKEN_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new TokenService(
          config.getOrThrow<string>("JWT_ADMIN_ACCESS_SECRET"),
          config.get<string>("JWT_ADMIN_ACCESS_TTL") ?? "15m"
        ),
    },
    {
      provide: ADMIN_REFRESH_TOKEN_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new TokenService(
          config.getOrThrow<string>("JWT_ADMIN_REFRESH_SECRET"),
          config.get<string>("JWT_ADMIN_REFRESH_TTL") ?? "7d"
        ),
    },
  ],
  exports: [
    CUSTOMER_ACCESS_TOKEN_SERVICE,
    CUSTOMER_REFRESH_TOKEN_SERVICE,
    ADMIN_ACCESS_TOKEN_SERVICE,
    ADMIN_REFRESH_TOKEN_SERVICE,
  ],
})
export class TokenModule {}
