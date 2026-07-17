import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
