import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CreateSessionDto } from "./dto/create-session.dto";

@Controller("auth")
export class AuthController {
  private static authServiceRef: AuthService;

  constructor(authService: AuthService) {
    AuthController.authServiceRef = authService;
  }

  @Post("session")
  async createSession(
    @Body() createSessionDto: CreateSessionDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return AuthController.authServiceRef.createSession(createSessionDto.idToken, response);
  }

  @Get("me")
  async getMe(@Req() request: Request) {
    return AuthController.authServiceRef.getSessionUser(request);
  }

  @Post("logout")
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return AuthController.authServiceRef.clearSession(request, response);
  }
}
