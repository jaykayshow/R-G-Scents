import { ApiPropertyOptional } from "@nestjs/swagger";
import { AdminRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateAdminUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ enum: AdminRole })
  @IsOptional()
  @IsEnum(AdminRole)
  role?: AdminRole;
}
