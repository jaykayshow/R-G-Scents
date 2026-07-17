import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
    });
    return items.map((i) => i.productId);
  }

  async add(userId: string, productId: string) {
    await this.prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
    return this.list(userId);
  }

  async remove(userId: string, productId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, productId } });
    return this.list(userId);
  }
}
