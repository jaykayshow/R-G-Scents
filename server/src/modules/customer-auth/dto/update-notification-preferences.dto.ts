import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyOrderUpdates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyShippingAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyPromotions?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyVipEarlyAccess?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyRestockAlerts?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyReviewRequests?: boolean;
}
