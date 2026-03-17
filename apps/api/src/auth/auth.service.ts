import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { Prisma, UserRole } from "../../../../generated/prisma";
import { appConfig } from "../shared/app-config";
import { firebaseAdminAuth } from "../firebase/firebase-admin";
import { PrismaService } from "../prisma/prisma.service";

type LocalUserSyncResult =
  | {
      status: "synced";
      userId: string;
      email: string;
      fullName: string;
      roleCount: number;
    }
  | {
      status: "skipped";
      reason: "db_unavailable" | "missing_email";
      detail?: string;
    };

type SessionUserResponse =
  | {
      authenticated: true;
      uid: string;
      email: string | null;
      localUser: LocalUserSyncResult;
    }
  | {
      authenticated: false;
    };

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(idToken: string, response: Response) {
    if (!idToken) {
      throw new UnauthorizedException("Missing Firebase ID token.");
    }

    const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);
    const localUser = await this.syncLocalUser({
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      name: decodedToken.name ?? null,
      locale: this.normalizeLocale(decodedToken.firebase?.sign_in_attributes?.locale),
    });
    const sessionCookie = await firebaseAdminAuth.createSessionCookie(idToken, {
      expiresIn: appConfig.firebaseSessionMaxAgeMs,
    });

    response.cookie(appConfig.firebaseSessionCookieName, sessionCookie, {
      httpOnly: true,
      secure: appConfig.nodeEnv === "production",
      sameSite: "lax",
      maxAge: appConfig.firebaseSessionMaxAgeMs,
      path: "/",
    });

    return {
      status: "ok",
      sessionCookieName: appConfig.firebaseSessionCookieName,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email ?? null,
      },
      localUser,
    };
  }

  async getSessionUser(request: Request): Promise<SessionUserResponse> {
    const sessionCookie = this.readCookie(request, appConfig.firebaseSessionCookieName);

    if (!sessionCookie) {
      return { authenticated: false };
    }

    try {
      const decodedSession = await firebaseAdminAuth.verifySessionCookie(sessionCookie, false);
      const localUser = await this.findLocalUser(decodedSession.uid, decodedSession.email ?? null);

      return {
        authenticated: true,
        uid: decodedSession.uid,
        email: decodedSession.email ?? null,
        localUser,
      };
    } catch {
      return { authenticated: false };
    }
  }

  async clearSession(request: Request, response: Response) {
    const sessionCookie = this.readCookie(request, appConfig.firebaseSessionCookieName);

    response.cookie(appConfig.firebaseSessionCookieName, "", {
      httpOnly: true,
      secure: appConfig.nodeEnv === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return {
      status: "ok",
      cleared: Boolean(sessionCookie),
    };
  }

  private readCookie(request: Request, cookieName: string) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(";").map((part: string) => part.trim());
    const match = cookies.find((entry: string) => entry.startsWith(`${cookieName}=`));

    if (!match) {
      return null;
    }

    return decodeURIComponent(match.slice(cookieName.length + 1));
  }

  private async findLocalUser(uid: string, email: string | null): Promise<LocalUserSyncResult> {
    if (!email) {
      return {
        status: "skipped",
        reason: "missing_email",
      };
    }

    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ firebaseUid: uid }, { email: email.toLowerCase() }],
        },
        include: {
          roleAssignments: true,
        },
      });

      if (!user) {
        return {
          status: "skipped",
          reason: "db_unavailable",
          detail: "No local LMS user exists yet. It will be created on next successful synced login.",
        };
      }

      return {
        status: "synced",
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roleCount: user.roleAssignments.length,
      };
    } catch (error) {
      return {
        status: "skipped",
        reason: "db_unavailable",
        detail: this.getPrismaErrorMessage(error),
      };
    }
  }

  private async syncLocalUser(params: {
    uid: string;
    email: string | null;
    name: string | null;
    locale: string | null;
  }): Promise<LocalUserSyncResult> {
    if (!params.email) {
      return {
        status: "skipped",
        reason: "missing_email",
      };
    }

    const normalizedEmail = params.email.toLowerCase().trim();
    const fullName = this.deriveFullName(normalizedEmail, params.name);
    const locale = params.locale ?? "nb";

    try {
      const user = await this.prisma.user.upsert({
        where: {
          email: normalizedEmail,
        },
        update: {
          firebaseUid: params.uid,
          fullName,
          locale,
        },
        create: {
          email: normalizedEmail,
          fullName,
          firebaseUid: params.uid,
          locale,
          roleAssignments: {
            create: {
              role: UserRole.STUDENT,
            },
          },
        },
        include: {
          roleAssignments: true,
        },
      });

      return {
        status: "synced",
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        roleCount: user.roleAssignments.length,
      };
    } catch (error) {
      if (this.isPrismaConnectivityError(error)) {
        return {
          status: "skipped",
          reason: "db_unavailable",
          detail: this.getPrismaErrorMessage(error),
        };
      }

      throw error;
    }
  }

  private deriveFullName(email: string, displayName: string | null) {
    if (displayName && displayName.trim().length > 0) {
      return displayName.trim();
    }

    const localPart = email.split("@")[0] ?? "Student";
    return localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private normalizeLocale(locale: unknown) {
    if (typeof locale !== "string" || locale.trim().length === 0) {
      return null;
    }

    return locale.trim().toLowerCase();
  }

  private isPrismaConnectivityError(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientRustPanicError
    );
  }

  private getPrismaErrorMessage(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientRustPanicError
    ) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Unknown Prisma error";
  }
}
