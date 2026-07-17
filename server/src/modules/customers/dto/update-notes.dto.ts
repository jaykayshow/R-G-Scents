import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateNotesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
