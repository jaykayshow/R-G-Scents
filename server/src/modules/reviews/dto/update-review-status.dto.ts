import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { ReviewStatus } from "@prisma/client";

export class UpdateReviewStatusDto {
  @ApiProperty({ enum: ReviewStatus })
  @IsEnum(ReviewStatus)
  status!: ReviewStatus;
}
