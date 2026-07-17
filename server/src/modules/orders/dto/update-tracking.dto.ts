import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateTrackingDto {
  @ApiProperty()
  @IsString()
  trackingNumber!: string;
}
