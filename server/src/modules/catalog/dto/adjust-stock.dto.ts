import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Min, MinLength } from "class-validator";

export class AdjustStockDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  newStock!: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  reason!: string;
}
