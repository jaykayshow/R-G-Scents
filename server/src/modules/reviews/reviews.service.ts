import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewStatusDto } from "./dto/update-review-status.dto";
import { ReplyReviewDto } from "./dto/reply-review.dto";

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listApproved() {
    return this.prisma.review.findMany({
      where: { status: "APPROVED" },
      include: { replies: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAllForAdmin() {
    return this.prisma.review.findMany({
      include: { replies: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateReviewDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Account no longer exists.");

    return this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        author: `${user.firstName} ${user.lastName}`.trim(),
        rating: dto.rating,
        title: dto.title,
        content: dto.content,
        verified: true,
        status: "PENDING",
      },
      include: { replies: true },
    });
  }

  async updateStatus(id: string, dto: UpdateReviewStatusDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Review not found.");

    const review = await this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: { replies: true },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: dto.status === "APPROVED" ? "Approved review" : dto.status === "REJECTED" ? "Rejected review" : "Updated review status",
      target: `Review by ${review.author}`,
      category: "REVIEW",
    });

    return review;
  }

  async reply(id: string, dto: ReplyReviewDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Review not found.");

    await this.prisma.reviewReply.create({
      data: { reviewId: id, author: "R&G Scents Support", content: dto.content },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Replied to review",
      target: `Review by ${existing.author}`,
      category: "REVIEW",
    });

    return this.prisma.review.findUnique({ where: { id }, include: { replies: true } });
  }
}
