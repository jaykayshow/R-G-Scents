import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { ReplyTicketDto } from "./dto/reply-ticket.dto";

const TICKET_INCLUDE = { messages: { orderBy: { createdAt: "asc" as const } } };

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      include: TICKET_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async getOne(userId: string, id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, include: TICKET_INCLUDE });
    if (!ticket || ticket.userId !== userId) throw new NotFoundException("Support ticket not found.");
    return ticket;
  }

  async create(userId: string, dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        category: dto.category,
        status: "OPEN",
        messages: { create: [{ author: "CUSTOMER", content: dto.message }] },
      },
      include: TICKET_INCLUDE,
    });
  }

  async reply(userId: string, id: string, dto: ReplyTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket || ticket.userId !== userId) throw new NotFoundException("Support ticket not found.");

    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: "OPEN",
        messages: { create: [{ author: "CUSTOMER", content: dto.content }] },
      },
      include: TICKET_INCLUDE,
    });
  }
}
