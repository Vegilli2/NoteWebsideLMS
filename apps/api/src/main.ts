import "reflect-metadata";
import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { appConfig } from "./shared/app-config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );

  await app.listen(appConfig.port);

  Logger.log(`API running on http://localhost:${appConfig.port}/api/v1`, "Bootstrap");
}

bootstrap().catch((error: unknown) => {
  Logger.error("Failed to bootstrap API", error);
  process.exit(1);
});
