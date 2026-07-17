import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class ProductVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(1)
  size!: string;

  @IsString()
  @MinLength(1)
  sku!: string;

  @IsString()
  @MinLength(1)
  barcode!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @IsInt()
  @Min(0)
  stock!: number;
}
