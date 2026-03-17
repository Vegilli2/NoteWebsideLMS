import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { PortalService } from "./portal.service";

@Controller("portal")
export class PortalController {
  private static portalServiceRef: PortalService;

  constructor(portalService: PortalService) {
    PortalController.portalServiceRef = portalService;
  }

  @Get("summary")
  getSummary(@Req() request: Request) {
    return PortalController.portalServiceRef.getSummary(request);
  }
}
