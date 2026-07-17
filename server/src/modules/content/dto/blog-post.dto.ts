import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreateBlogPostDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  slug!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  excerpt!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  content!: string[];

  @ApiProperty()
  @IsString()
  @MinLength(1)
  category!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  author!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  image!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishAt?: string;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
