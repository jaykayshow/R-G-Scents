import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { OrderStatus } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { CouponsService } from "../coupons/coupons.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { UpdateTrackingDto } from "./dto/update-tracking.dto";

const STATUS_NOTES: Record<OrderStatus, string> = {
  PENDING: "Order placed",
  PROCESSING: "Payment confirmed, preparing order",
  SHIPPED: "Handed to courier",
  DELIVERED: "Delivered to recipient",
  CANCELLED: "Order cancelled",
  REFUNDED: "Order refunded",
};

const ORDER_INCLUDE = { items: true, trackingEvents: true } as const;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly coupons: CouponsService
  ) {}

  private async generateOrderNumber(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt++) {
      const count = await this.prisma.order.count();
      const candidate = `RG-${100000 + count + 1 + attempt}`;
      const exists = await this.prisma.order.findUnique({ where: { orderNumber: candidate } });
      if (!exists) return candidate;
    }
    return `RG-${Date.now()}`;
  }

  async createOrder(dto: CreateOrderDto, userId?: string) {
    if (!userId && !dto.guestEmail) {
      throw new BadRequestException("Guest checkout requires an email address.");
    }

    const variantIds = dto.items.map((i) => i.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const items = dto.items.map((input) => {
      const variant = variants.find((v) => v.id === input.variantId);
      if (!variant) throw new NotFoundException(`Variant ${input.variantId} not found.`);
      if (variant.stock < input.quantity) {
        throw new BadRequestException(
          `${variant.product.name} (${variant.size}) only has ${variant.stock} unit(s) left in stock.`
        );
      }
      return { input, variant };
    });

    const subtotal = items.reduce((sum, { input, variant }) => sum + Number(variant.price) * input.quantity, 0);

    const settings = await this.prisma.siteSettings.findUnique({ where: { id: 1 } });
    const flatShippingRate = settings ? Number(settings.flatShippingRate) : 15;
    const freeShippingThreshold = settings ? Number(settings.freeShippingThreshold) : 200;
    const taxRatePercent = settings ? Number(settings.taxRatePercent) : 5;

    const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : flatShippingRate;

    let discount = 0;
    let couponCode: string | undefined;
    if (dto.couponCode) {
      const validation = await this.coupons.validateCoupon(dto.couponCode, subtotal);
      if (!validation.valid || !validation.coupon) {
        throw new BadRequestException(validation.message);
      }
      discount = this.coupons.calculateDiscount(validation.coupon, subtotal, shipping);
      couponCode = validation.coupon.code;
    }

    const tax = Math.round((subtotal - discount) * (taxRatePercent / 100) * 100) / 100;
    const total = Math.max(0, subtotal - discount + shipping + tax);

    const orderNumber = await this.generateOrderNumber();

    return this.prisma.$transaction(async (tx) => {
      for (const { input, variant } of items) {
        const result = await tx.productVariant.updateMany({
          where: { id: variant.id, stock: { gte: input.quantity } },
          data: { stock: { decrement: input.quantity } },
        });
        if (result.count === 0) {
          throw new BadRequestException(
            `${variant.product.name} (${variant.size}) is no longer available in the requested quantity.`
          );
        }
        const freshVariant = await tx.productVariant.findUniqueOrThrow({ where: { id: variant.id } });
        await tx.inventoryHistory.create({
          data: {
            productId: variant.productId,
            variantId: variant.id,
            change: -input.quantity,
            previousStock: freshVariant.stock + input.quantity,
            newStock: freshVariant.stock,
            reason: "Sale fulfillment",
            actorId: null,
          },
        });
        await tx.product.update({
          where: { id: variant.productId },
          data: { salesCount: { increment: input.quantity } },
        });
      }

      if (couponCode) {
        await tx.coupon.update({ where: { code: couponCode }, data: { usageCount: { increment: 1 } } });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: userId ?? null,
          guestEmail: userId ? null : dto.guestEmail,
          status: "PENDING",
          subtotal,
          shipping,
          tax,
          discount,
          total,
          couponCode,
          paymentMethod: dto.paymentMethod,
          shippingFullName: dto.shipFullName,
          shippingLine1: dto.shipLine1,
          shippingLine2: dto.shipLine2,
          shippingCity: dto.shipCity,
          shippingState: dto.shipState,
          shippingCountry: dto.shipCountry,
          shippingPostalCode: dto.shipPostalCode,
          shippingPhone: dto.shipPhone,
          giftWrap: dto.giftWrap ?? false,
          giftMessage: dto.giftMessage,
          items: {
            create: items.map(({ input, variant }) => ({
              productId: variant.productId,
              variantId: variant.id,
              productName: variant.product.name,
              productSlug: variant.product.slug,
              image: variant.product.images[0] ?? "",
              variantSize: variant.size,
              quantity: input.quantity,
              unitPrice: variant.price,
            })),
          },
          trackingEvents: {
            create: [{ status: "PENDING", note: STATUS_NOTES.PENDING }],
          },
          payment: {
            create: {
              method: dto.paymentMethod,
              status: "PENDING_PAYMENT",
              amount: total,
            },
          },
        },
        include: ORDER_INCLUDE,
      });
    });
  }

  async listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async getByOrderNumber(orderNumber: string, requesterUserId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException("Order not found.");

    if (order.userId && order.userId !== requesterUserId) {
      throw new UnauthorizedException("You do not have access to this order.");
    }

    return order;
  }

  async listAll() {
    return this.prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  }

  async getByOrderNumberAdmin(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException("Order not found.");
    return order;
  }

  async updateStatus(orderNumber: string, dto: UpdateOrderStatusDto, actor: { id: string; name: string }) {
    const order = await this.prisma.order.findUnique({ where: { orderNumber } });
    if (!order) throw new NotFoundException("Order not found.");

    const updated = await this.prisma.order.update({
      where: { orderNumber },
      data: {
        status: dto.status,
        trackingEvents: {
          create: [{ status: dto.status, note: dto.note ?? STATUS_NOTES[dto.status] }],
        },
      },
      include: ORDER_INCLUDE,
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: `Changed order status to ${dto.status}`,
      target: orderNumber,
      category: "ORDER",
    });

    return updated;
  }

  async updateTracking(orderNumber: string, dto: UpdateTrackingDto, actor: { id: string; name: string }) {
    const order = await this.prisma.order.findUnique({ where: { orderNumber } });
    if (!order) throw new NotFoundException("Order not found.");

    const updated = await this.prisma.order.update({
      where: { orderNumber },
      data: { trackingNumber: dto.trackingNumber },
      include: ORDER_INCLUDE,
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated tracking number",
      target: `${orderNumber} — ${dto.trackingNumber}`,
      category: "ORDER",
    });

    return updated;
  }
}
