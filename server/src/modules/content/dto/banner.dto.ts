import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { BannerPlacement } from "@prisma/client";

export class CreateBannerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaHref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ enum: BannerPlacement })
  @IsEnum(BannerPlacement)
  placement!: BannerPlacement;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}
