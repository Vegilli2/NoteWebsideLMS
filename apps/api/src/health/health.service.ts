import { Injectable } from "@nestjs/common";
import { appConfig } from "../shared/app-config";

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: "ok",
      service: "notewebside-api",
      environment: appConfig.nodeEnv,
      timestamp: new Date().toISOString(),
    };
  }
}
