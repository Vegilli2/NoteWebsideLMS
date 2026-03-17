import { AdminModule } from "./admin/admin.module";
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { HealthModule } from "./health/health.module";
import { IdentityModule } from "./identity/identity.module";
import { PortalModule } from "./portal/portal.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [PrismaModule, AuthModule, HealthModule, CatalogModule, IdentityModule, PortalModule, AdminModule],
})
export class AppModule {}
