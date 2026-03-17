import "server-only";
import { cookies } from "next/headers";

export type PortalSummary =
  | {
      authenticated: false;
    }
  | {
      authenticated: true;
      firebase: {
        uid: string;
        email: string | null;
      };
      localUser:
        | {
            status: "synced";
            userId: string;
            fullName: string;
            email: string;
            roles: string[];
          }
        | {
            status: "not_synced";
          };
      stats: {
        activePackages: number;
        activeCourses: number;
      };
      entitlements: Array<{
        id: string;
        title: string;
        description: string;
        levelCode: string;
        sourceType: string;
        teacherHelpEnabled: boolean;
        certificateEnabled: boolean;
        startsAt: string;
        endsAt: string | null;
        courseCount: number;
        courses: Array<{
          id: string;
          slug: string;
          title: string;
          description: string;
          levelCode: string;
        }>;
      }>;
    };

export async function getServerPortalSummary(): Promise<PortalSummary> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return { authenticated: false };
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${encodeURIComponent(entry.value)}`)
    .join("; ");

  const response = await fetch(`${apiBaseUrl}/portal/summary`, {
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

  return (await response.json()) as PortalSummary;
}
