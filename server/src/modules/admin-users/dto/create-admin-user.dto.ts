import { ApiProperty } from "@nestjs/swagger";
import { AdminRole } from "@prisma/client";
import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";

export class CreateAdminUserDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: AdminRole })
  @IsEnum(AdminRole)
  role!: AdminRole;
}
