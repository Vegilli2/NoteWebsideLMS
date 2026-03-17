import { Controller, Get } from "@nestjs/common";
import { IdentityService } from "./identity.service";

@Controller("identity")
export class IdentityController {
  private static identityServiceRef: IdentityService;

  constructor(identityService: IdentityService) {
    IdentityController.identityServiceRef = identityService;
  }

  @Get("providers")
  getProviders() {
    return IdentityController.identityServiceRef.getProviders();
  }

  @Get("firebase-status")
  getFirebaseStatus() {
    return IdentityController.identityServiceRef.getFirebaseStatus();
  }
}
