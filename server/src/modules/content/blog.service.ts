import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { CreateBlogPostDto } from "./dto/blog-post.dto";
import { UpdateBlogPostDto } from "./dto/blog-post.dto";

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async listPublished() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishAt: "desc" },
    });
  }

  async getPublishedBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({ where: { slug, published: true } });
    if (!post) throw new NotFoundException("Article not found.");
    return post;
  }

  async listAllForAdmin() {
    return this.prisma.blogPost.findMany({ orderBy: { publishAt: "desc" } });
  }

  async create(dto: CreateBlogPostDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Slug "${dto.slug}" is already in use.`);

    const post = await this.prisma.blogPost.create({
      data: { ...dto, publishAt: dto.publishAt ? new Date(dto.publishAt) : new Date() },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: `Created blog post (${post.published ? "published" : "draft"})`,
      target: post.title,
      category: "BLOG",
    });

    return post;
  }

  async update(slug: string, dto: UpdateBlogPostDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) throw new NotFoundException("Article not found.");

    if (dto.slug && dto.slug !== slug) {
      const slugOwner = await this.prisma.blogPost.findUnique({ where: { slug: dto.slug } });
      if (slugOwner) throw new ConflictException(`Slug "${dto.slug}" is already in use.`);
    }

    const post = await this.prisma.blogPost.update({
      where: { slug },
      data: { ...dto, publishAt: dto.publishAt ? new Date(dto.publishAt) : undefined },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: `Updated blog post (${post.published ? "published" : "draft"})`,
      target: post.title,
      category: "BLOG",
    });

    return post;
  }

  async remove(slug: string, actor: { id: string; name: string }) {
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!existing) throw new NotFoundException("Article not found.");

    await this.prisma.blogPost.delete({ where: { slug } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Deleted blog post",
      target: existing.title,
      category: "BLOG",
    });

    return { message: "Article deleted." };
  }
}
