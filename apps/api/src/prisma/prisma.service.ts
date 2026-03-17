import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../../generated/prisma";
import { appConfig } from "../shared/app-config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: appConfig.databaseUrl,
      }),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
