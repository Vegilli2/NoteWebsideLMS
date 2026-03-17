import { Module } from "@nestjs/common";
import { AdminCatalogModule } from "./catalog/admin-catalog.module";

@Module({
  imports: [AdminCatalogModule],
})
export class AdminModule {}
