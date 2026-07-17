import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Max, Min, MinLength } from "class-validator";

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  content!: string;
}
