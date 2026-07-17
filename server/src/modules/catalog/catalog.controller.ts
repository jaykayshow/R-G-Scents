import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CatalogService } from "./catalog.service";

@ApiTags("catalog")
@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("products")
  async listProducts() {
    return this.catalog.listProducts();
  }

  @Get("products/:slug")
  async getProduct(@Param("slug") slug: string) {
    return this.catalog.getProductBySlug(slug);
  }

  @Get("categories")
  async listCategories() {
    return this.catalog.listCategories();
  }

  @Get("collections")
  async listCollections() {
    return this.catalog.listCollections();
  }
}
