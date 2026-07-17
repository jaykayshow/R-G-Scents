import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string, userId?: string) {
    const normalized = email.toLowerCase();
    await this.prisma.newsletter.upsert({
      where: { email: normalized },
      update: { confirmed: true, userId: userId ?? undefined },
      create: { email: normalized, confirmed: true, userId },
    });

    return { message: "You're on the list. Thanks for joining." };
  }
}
