import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Coupon } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { CreateCouponDto } from "./dto/create-coupon.dto";
import { UpdateCouponDto } from "./dto/update-coupon.dto";

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  message: string;
}

@Injectable()
export class CouponsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!coupon) {
      return { valid: false, message: "This coupon code is not valid." };
    }
    if (!coupon.active) {
      return { valid: false, message: "This coupon is no longer active." };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "This coupon has reached its usage limit." };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, message: "This coupon has expired." };
    }
    if (coupon.minSubtotal && subtotal < Number(coupon.minSubtotal)) {
      return {
        valid: false,
        message: `Add $${(Number(coupon.minSubtotal) - subtotal).toFixed(2)} more to use this code.`,
      };
    }

    return { valid: true, coupon, message: `"${coupon.code}" applied — ${coupon.description}.` };
  }

  calculateDiscount(coupon: Coupon, subtotal: number, shipping: number): number {
    if (coupon.type === "PERCENTAGE") return Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100;
    if (coupon.type === "FIXED") return Math.min(Number(coupon.value), subtotal);
    if (coupon.type === "FREE_SHIPPING") return shipping;
    return 0;
  }

  async incrementUsage(code: string) {
    await this.prisma.coupon.update({
      where: { code: code.trim().toUpperCase() },
      data: { usageCount: { increment: 1 } },
    });
  }

  async list() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  }

  async create(dto: CreateCouponDto, actor: { id: string; name: string }) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.coupon.findUnique({ where: { code } });
    if (existing) throw new ConflictException(`A coupon with code "${code}" already exists.`);

    const coupon = await this.prisma.coupon.create({
      data: {
        code,
        type: dto.type,
        value: dto.value,
        description: dto.description,
        minSubtotal: dto.minSubtotal,
        active: dto.active ?? true,
        usageLimit: dto.usageLimit,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Created coupon",
      target: coupon.code,
      category: "COUPON",
    });

    return coupon;
  }

  async update(code: string, dto: UpdateCouponDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!existing) throw new NotFoundException("Coupon not found.");

    const coupon = await this.prisma.coupon.update({
      where: { code: code.toUpperCase() },
      data: {
        type: dto.type,
        value: dto.value,
        description: dto.description,
        minSubtotal: dto.minSubtotal,
        active: dto.active,
        usageLimit: dto.usageLimit,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated coupon",
      target: coupon.code,
      category: "COUPON",
    });

    return coupon;
  }

  async delete(code: string, actor: { id: string; name: string }) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!existing) throw new NotFoundException("Coupon not found.");

    await this.prisma.coupon.delete({ where: { code: code.toUpperCase() } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Deleted coupon",
      target: existing.code,
      category: "COUPON",
    });

    return { message: "Coupon deleted." };
  }
}
