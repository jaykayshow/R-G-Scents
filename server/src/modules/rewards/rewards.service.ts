import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async transactions(userId: string) {
    return this.prisma.rewardTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async referrals(userId: string) {
    const referred = await this.prisma.user.findMany({
      where: { referredById: userId },
      include: { orders: { select: { id: true }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });

    return referred.map((u) => ({
      name: `${u.firstName} ${u.lastName.charAt(0)}.`,
      joinedAt: u.createdAt,
      status: u.orders.length > 0 ? "Completed" : "Pending First Order",
      reward: u.orders.length > 0 ? "$25 Credit" : "—",
    }));
  }
}
