import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { SupportService } from "./support.service";
import { CreateTicketDto } from "./dto/create-ticket.dto";
import { ReplyTicketDto } from "./dto/reply-ticket.dto";
import { CustomerJwtGuard } from "../../common/guards/customer-jwt.guard";
import { CurrentUser, RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("support")
@ApiCookieAuth()
@UseGuards(CustomerJwtGuard)
@Controller("support-tickets")
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return this.support.list(user.id);
  }

  @Get(":id")
  async getOne(@Param("id") id: string, @CurrentUser() user: RequestUser) {
    return this.support.getOne(user.id, id);
  }

  @Post()
  async create(@Body() dto: CreateTicketDto, @CurrentUser() user: RequestUser) {
    return this.support.create(user.id, dto);
  }

  @Post(":id/messages")
  async reply(@Param("id") id: string, @Body() dto: ReplyTicketDto, @CurrentUser() user: RequestUser) {
    return this.support.reply(user.id, id, dto);
  }
}
