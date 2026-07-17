import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  label!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  state!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  country!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  postalCode!: string;

  @ApiProperty()
  @IsString()
  @MinLength(7)
  phone!: string;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
