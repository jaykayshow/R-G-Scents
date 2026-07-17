import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { UpdateNotesDto } from "./dto/update-notes.dto";

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  private async withStats() {
    const users = await this.prisma.user.findMany({
      include: { orders: { select: { total: true } } },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      phone: u.phone,
      joinedAt: u.createdAt,
      ordersCount: u.orders.length,
      totalSpent: u.orders.reduce((sum, o) => sum + Number(o.total), 0),
      status: u.status,
      notes: u.adminNotes,
    }));
  }

  async list() {
    return this.withStats();
  }

  async getOne(id: string) {
    const all = await this.withStats();
    const customer = all.find((c) => c.id === id);
    if (!customer) throw new NotFoundException("Customer not found.");
    return customer;
  }

  async toggleStatus(id: string, actor: { id: string; name: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Customer not found.");

    const newStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await this.prisma.user.update({ where: { id }, data: { status: newStatus } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: newStatus === "SUSPENDED" ? "Suspended customer account" : "Reactivated customer account",
      target: user.email,
      category: "CUSTOMER",
    });

    return this.getOne(id);
  }

  async updateNotes(id: string, dto: UpdateNotesDto, actor: { id: string; name: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("Customer not found.");

    await this.prisma.user.update({ where: { id }, data: { adminNotes: dto.notes } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated customer notes",
      target: user.email,
      category: "CUSTOMER",
    });

    return this.getOne(id);
  }
}
