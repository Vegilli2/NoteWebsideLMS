import { Controller, Get } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  private static healthServiceRef: HealthService;

  constructor(healthService: HealthService) {
    HealthController.healthServiceRef = healthService;
  }

  @Get()
  getHealth() {
    return HealthController.healthServiceRef.getHealth();
  }
}
