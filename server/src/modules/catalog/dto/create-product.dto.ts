import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { CollectionSlug, Gender, Longevity, Projection } from "@prisma/client";
import { ProductVariantDto } from "./product-variant.dto";

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty({ enum: CollectionSlug })
  @IsEnum(CollectionSlug)
  collectionSlug!: CollectionSlug;

  @ApiProperty()
  @IsString()
  tagline!: string;

  @ApiProperty()
  @IsString()
  shortDescription!: string;

  @ApiProperty()
  @IsString()
  longDescription!: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  images!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  notesTop!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  notesMiddle!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  notesBase!: string[];

  @ApiProperty({ enum: Longevity })
  @IsEnum(Longevity)
  longevity!: Longevity;

  @ApiProperty({ enum: Projection })
  @IsEnum(Projection)
  projection!: Projection;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  occasion!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  season!: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ingredients!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLimitedEdition?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageAlt?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ type: [ProductVariantDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];
}
