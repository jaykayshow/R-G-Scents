import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { CreateBannerDto, UpdateBannerDto } from "./dto/banner.dto";

@Injectable()
export class BannersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list() {
    return this.prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(dto: CreateBannerDto, actor: { id: string; name: string }) {
    const banner = await this.prisma.banner.create({ data: { ...dto, active: dto.active ?? false } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Created banner",
      target: banner.title,
      category: "BANNER",
    });

    return banner;
  }

  async update(id: string, dto: UpdateBannerDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Banner not found.");

    const banner = await this.prisma.banner.update({ where: { id }, data: dto });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated banner",
      target: banner.title,
      category: "BANNER",
    });

    return banner;
  }

  async toggleActive(id: string, actor: { id: string; name: string }) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Banner not found.");

    const banner = await this.prisma.banner.update({ where: { id }, data: { active: !existing.active } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: banner.active ? "Activated banner" : "Deactivated banner",
      target: banner.title,
      category: "BANNER",
    });

    return banner;
  }

  async remove(id: string, actor: { id: string; name: string }) {
    const existing = await this.prisma.banner.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Banner not found.");

    await this.prisma.banner.delete({ where: { id } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Deleted banner",
      target: existing.title,
      category: "BANNER",
    });

    return { message: "Banner deleted." };
  }
}
