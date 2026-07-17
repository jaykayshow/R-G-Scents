import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { CollectionSlug } from "@prisma/client";
import { CatalogService } from "./catalog.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { AdjustStockDto } from "./dto/adjust-stock.dto";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { UpdateCollectionDto } from "./dto/update-collection.dto";
import { AdminJwtGuard } from "../../common/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../../common/guards/admin-roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentAdmin, RequestAdmin } from "../../common/decorators/current-admin.decorator";

@ApiTags("admin-catalog")
@ApiCookieAuth()
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Controller("admin")
export class AdminCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  private actor(admin: RequestAdmin) {
    return { id: admin.id, name: admin.name };
  }

  // Products
  @Roles("SUPER_ADMIN", "ADMIN")
  @Post("products")
  async createProduct(@Body() dto: CreateProductDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.catalog.createProduct(dto, this.actor(admin));
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Patch("products/:id")
  async updateProduct(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.catalog.updateProduct(id, dto, this.actor(admin));
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Delete("products/:id")
  async deleteProduct(@Param("id") id: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.catalog.deleteProduct(id, this.actor(admin));
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Post("products/bulk-delete")
  async deleteProducts(@Body("ids") ids: string[], @CurrentAdmin() admin: RequestAdmin) {
    return this.catalog.deleteProducts(ids, this.actor(admin));
  }

  // Inventory
  @Roles("SUPER_ADMIN", "ADMIN")
  @Patch("products/:productId/variants/:variantId/stock")
  async adjustStock(
    @Param("productId") productId: string,
    @Param("variantId") variantId: string,
    @Body() dto: AdjustStockDto,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.catalog.adjustStock(productId, variantId, dto, this.actor(admin));
  }

  @Roles("SUPER_ADMIN", "ADMIN")
  @Get("inventory/history")
  async inventoryHistory() {
    return this.catalog.listInventoryHistory();
  }

  // Categories
  @Roles("SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR")
  @Post("categories")
  async createCategory(@Body() dto: CreateCategoryDto, @CurrentAdmin() admin: RequestAdmin) {
    return this.catalog.createCategory(dto, this.actor(admin));
  }

  @Roles("SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR")
  @Patch("categories/:id")
  async updateCategory(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.catalog.updateCategory(id, dto, this.actor(admin));
  }

  @Roles("SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR")
  @Delete("categories/:id")
  async deleteCategory(@Param("id") id: string, @CurrentAdmin() admin: RequestAdmin) {
    return this.catalog.deleteCategory(id, this.actor(admin));
  }

  // Collections
  @Roles("SUPER_ADMIN", "ADMIN", "CONTENT_EDITOR")
  @Patch("collections/:slug")
  async updateCollection(
    @Param("slug") slug: CollectionSlug,
    @Body() dto: UpdateCollectionDto,
    @CurrentAdmin() admin: RequestAdmin
  ) {
    return this.catalog.updateCollection(slug, dto, this.actor(admin));
  }
}
