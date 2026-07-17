import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CollectionSlug } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditLogService } from "../../common/audit/audit-log.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AdjustStockDto } from "./dto/adjust-stock.dto";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService
  ) {}

  // ---------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------

  async listProducts() {
    return this.prisma.product.findMany({
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException("Product not found.");
    return product;
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException("Product not found.");
    return product;
  }

  async createProduct(dto: CreateProductDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`Slug "${dto.slug}" is already in use by another product.`);
    }

    const { variants, ...productData } = dto;
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((v) => ({
            size: v.size,
            sku: v.sku,
            barcode: v.barcode,
            price: v.price,
            stock: v.stock,
          })),
        },
      },
      include: { variants: true },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Created product",
      target: product.name,
      category: "PRODUCT",
    });

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!existing) throw new NotFoundException("Product not found.");

    if (dto.slug && dto.slug !== existing.slug) {
      const slugOwner = await this.prisma.product.findUnique({ where: { slug: dto.slug } });
      if (slugOwner && slugOwner.id !== id) {
        throw new ConflictException(`Slug "${dto.slug}" is already in use by another product.`);
      }
    }

    const { variants, ...productData } = dto;

    if (variants) {
      const keepIds = variants.filter((v) => v.id).map((v) => v.id as string);
      await this.prisma.productVariant.deleteMany({
        where: { productId: id, id: { notIn: keepIds } },
      });

      for (const v of variants) {
        if (v.id) {
          await this.prisma.productVariant.update({
            where: { id: v.id },
            data: { size: v.size, sku: v.sku, barcode: v.barcode, price: v.price, stock: v.stock },
          });
        } else {
          await this.prisma.productVariant.create({
            data: { productId: id, size: v.size, sku: v.sku, barcode: v.barcode, price: v.price, stock: v.stock },
          });
        }
      }
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: productData,
      include: { variants: true },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated product",
      target: product.name,
      category: "PRODUCT",
    });

    return product;
  }

  async deleteProduct(id: string, actor: { id: string; name: string }) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Product not found.");

    await this.prisma.product.delete({ where: { id } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Deleted product",
      target: existing.name,
      category: "PRODUCT",
    });

    return { message: "Product deleted." };
  }

  async deleteProducts(ids: string[], actor: { id: string; name: string }) {
    const existing = await this.prisma.product.findMany({ where: { id: { in: ids } } });
    await this.prisma.product.deleteMany({ where: { id: { in: ids } } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: `Bulk deleted ${existing.length} product(s)`,
      target: existing.map((p) => p.name).join(", "),
      category: "PRODUCT",
    });

    return { message: `${existing.length} product(s) deleted.` };
  }

  // ---------------------------------------------------------------------
  // Inventory
  // ---------------------------------------------------------------------

  async adjustStock(
    productId: string,
    variantId: string,
    dto: AdjustStockDto,
    actor: { id: string; name: string }
  ) {
    const variant = await this.prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) {
      throw new NotFoundException("Variant not found.");
    }

    const previousStock = variant.stock;
    const newStock = Math.max(0, dto.newStock);

    const [updatedVariant] = await this.prisma.$transaction([
      this.prisma.productVariant.update({ where: { id: variantId }, data: { stock: newStock } }),
      this.prisma.inventoryHistory.create({
        data: {
          productId,
          variantId,
          change: newStock - previousStock,
          previousStock,
          newStock,
          reason: dto.reason,
          actorId: actor.id,
        },
      }),
    ]);

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated stock",
      target: `${variant.sku} (${variant.size})`,
      category: "INVENTORY",
    });

    return updatedVariant;
  }

  async listInventoryHistory() {
    return this.prisma.inventoryHistory.findMany({
      include: { product: true, variant: true, actor: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ---------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------

  async listCategories() {
    return this.prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async createCategory(dto: CreateCategoryDto, actor: { id: string; name: string }) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException(`A category with slug "${slug}" already exists.`);

    const category = await this.prisma.category.create({
      data: { name: dto.name, slug, description: dto.description },
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Created category",
      target: category.name,
      category: "PRODUCT",
    });

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Category not found.");

    const data: { name?: string; slug?: string; description?: string } = { ...dto };
    if (dto.name) data.slug = slugify(dto.name);

    const category = await this.prisma.category.update({ where: { id }, data });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated category",
      target: category.name,
      category: "PRODUCT",
    });

    return category;
  }

  async deleteCategory(id: string, actor: { id: string; name: string }) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Category not found.");

    await this.prisma.category.delete({ where: { id } });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Deleted category",
      target: existing.name,
      category: "PRODUCT",
    });

    return { message: "Category deleted." };
  }

  // ---------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------

  async listCollections() {
    return this.prisma.collection.findMany();
  }

  async updateCollection(slug: CollectionSlug, dto: UpdateCollectionDto, actor: { id: string; name: string }) {
    const existing = await this.prisma.collection.findUnique({ where: { slug } });
    if (!existing) throw new NotFoundException("Collection not found.");

    const collection = await this.prisma.collection.update({
      where: { slug },
      data: dto,
    });

    await this.auditLog.log({
      actorId: actor.id,
      actorName: actor.name,
      action: "Updated collection",
      target: collection.name,
      category: "PRODUCT",
    });

    return collection;
  }
}
