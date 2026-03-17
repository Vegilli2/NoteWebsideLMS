import "server-only";
import { cookies } from "next/headers";

export type LocalUserStatus =
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

export type AuthSessionResponse =
  | {
      authenticated: true;
      uid: string;
      email: string | null;
      localUser: LocalUserStatus;
    }
  | {
      authenticated: false;
    };

export async function getServerAuthSession(): Promise<AuthSessionResponse> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return { authenticated: false };
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${encodeURIComponent(entry.value)}`)
    .join("; ");

  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    method: "GET",
    headers: cookieHeader
      ? {
          cookie: cookieHeader,
        }
      : {},
    cache: "no-store",
  });

  if (!response.ok) {
    return { authenticated: false };
  }

  return (await response.json()) as AuthSessionResponse;
}
