import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateAddressDto, UpdateAddressDto } from "./dto/address.dto";

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.address.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  }

  async create(userId: string, dto: CreateAddressDto) {
    const existingCount = await this.prisma.address.count({ where: { userId } });
    return this.prisma.address.create({
      data: { ...dto, userId, isDefault: existingCount === 0 },
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException("Address not found.");

    return this.prisma.address.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException("Address not found.");

    await this.prisma.address.delete({ where: { id } });

    if (existing.isDefault) {
      const next = await this.prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
      if (next) {
        await this.prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    return { message: "Address removed." };
  }

  async setDefault(userId: string, id: string) {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) throw new NotFoundException("Address not found.");

    await this.prisma.$transaction([
      this.prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      this.prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    return this.list(userId);
  }
}
