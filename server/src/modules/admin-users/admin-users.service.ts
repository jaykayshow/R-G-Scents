import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { CreateAdminUserDto } from "./dto/create-admin-user.dto";
import { UpdateAdminUserDto } from "./dto/update-admin-user.dto";

const SALT_ROUNDS = 12;

function sanitize<T extends { passwordHash: string }>(admin: T) {
  const { passwordHash: _passwordHash, ...rest } = admin;
  void _passwordHash;
  return rest;
}

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async list() {
    const admins = await this.prisma.adminUser.findMany({
      include: { role: true },
      orderBy: { createdAt: "asc" },
    });
    return admins.map((a) => ({ ...sanitize(a), role: a.role.name }));
  }

  async create(dto: CreateAdminUserDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.adminUser.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException("An admin account with this email already exists.");

    const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
    if (!role) throw new NotFoundException(`Role "${dto.role}" not found.`);

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const admin = await this.prisma.adminUser.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        passwordHash,
        roleId: role.id,
        active: true,
      },
      include: { role: true },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: `Created admin account (${dto.role})`,
      target: admin.email,
      category: "USER",
    });

    return { ...sanitize(admin), role: admin.role.name };
  }

  async update(id: string, dto: UpdateAdminUserDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Admin account not found.");

    const data: { name?: string; roleId?: string } = { name: dto.name };
    if (dto.role) {
      const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
      if (!role) throw new NotFoundException(`Role "${dto.role}" not found.`);
      data.roleId = role.id;
    }

    const admin = await this.prisma.adminUser.update({ where: { id }, data, include: { role: true } });

    if (dto.role) {
      await this.auditLog.log({
        actorId: actor.id,
        actorName: actor.name,
        action: `Changed role to ${dto.role}`,
        target: admin.email,
        category: "USER",
      });
    }

    return { ...sanitize(admin), role: admin.role.name };
  }

  async toggleActive(id: string, actor: { id: string; name: string }) {
    if (id === actor.id) {
      throw new BadRequestException("You cannot deactivate your own account.");
    }

    const existing = await this.prisma.adminUser.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Admin account not found.");

    const admin = await this.prisma.adminUser.update({
      where: { id },
      data: { active: !existing.active },
      include: { role: true },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: admin.active ? "Reactivated admin account" : "Deactivated admin account",
      target: admin.email,
      category: "USER",
    });

    return { ...sanitize(admin), role: admin.role.name };
  }
}
