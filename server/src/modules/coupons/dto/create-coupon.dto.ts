import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CouponType } from "@prisma/client";
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ enum: CouponType })
  @IsEnum(CouponType)
  type!: CouponType;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  value!: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
