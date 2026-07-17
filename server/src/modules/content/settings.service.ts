import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { UpdateSettingsDto } from "./dto/update-settings.dto";

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async get() {
    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (settings) return settings;
    return this.prisma.siteSettings.create({
      data: {
        id: 1,
        siteName: "R&G Scents",
        supportEmail: "concierge@rgscents.com",
        supportPhone: "",
        taxRatePercent: 5,
        flatShippingRate: 15,
        freeShippingThreshold: 200,
        metaTitle: "R&G Scents",
        metaDescription: "",
      },
    });
  }

  async update(dto: UpdateSettingsDto, actor: { id: string; name: string }, section: string) {
    await this.get();
    const settings = await this.prisma.siteSettings.update({ where: { id: 1 }, data: dto });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: `Updated ${section} settings`,
      target: section,
      category: "SETTINGS",
    });

    return settings;
  }
}
