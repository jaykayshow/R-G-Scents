import { Injectable } from "@nestjs/common";
import { AuditCategory } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    actorId?: string;
    actorName: string;
    action: string;
    target: string;
    category: AuditCategory;
  }) {
    return this.prisma.auditLog.create({ data: params });
  }

  async list() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
  }
}
