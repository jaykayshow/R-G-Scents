import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { PaymentMethod } from "@prisma/client";

class OrderItemInputDto {
  @ApiProperty()
  @IsString()
  variantId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items!: OrderItemInputDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shipFullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shipLine1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shipLine2?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shipCity!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shipState!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shipCountry!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shipPostalCode!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  shipPhone!: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  giftWrap?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  giftMessage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;
}
