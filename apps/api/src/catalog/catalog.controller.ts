import { Controller, Get } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

@Controller("catalog")
export class CatalogController {
  private static catalogServiceRef: CatalogService;

  constructor(catalogService: CatalogService) {
    CatalogController.catalogServiceRef = catalogService;
  }

  @Get("summary")
  getSummary() {
    return CatalogController.catalogServiceRef.getSummary();
  }
}
