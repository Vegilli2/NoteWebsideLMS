import "server-only";
import { cookies } from "next/headers";

export type AdminCatalogOverview = {
  levelCodeOptions: string[];
  levels: Array<{
    id: string;
    code: string;
    title: string;
    courseCount: number;
    packageCount: number;
  }>;
  courses: Array<{
    id: string;
    levelId: string;
    levelCode: string;
    slug: string;
    title: string;
    description: string;
    isPublished: boolean;
  }>;
  packages: Array<{
    id: string;
    levelId: string;
    levelCode: string;
    slug: string;
    title: string;
    description: string;
    teacherHelpEnabled: boolean;
    certificateEnabled: boolean;
    trialDays: number | null;
    courseTitles: string[];
  }>;
  users: Array<{
    id: string;
    email: string;
    fullName: string;
    entitlementTitles: string[];
  }>;
};

export async function getServerAdminCatalogOverview(): Promise<AdminCatalogOverview> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return {
      levelCodeOptions: ["A1", "A2", "B1", "B2", "C1"],
      levels: [],
      courses: [],
      packages: [],
      users: [],
    };
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${encodeURIComponent(entry.value)}`)
    .join("; ");

  const response = await fetch(`${apiBaseUrl}/admin/catalog/overview`, {
    method: "GET",
    headers: cookieHeader
      ? {
          cookie: cookieHeader,
        }
      : {},
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load admin catalog overview.");
  }

  return (await response.json()) as AdminCatalogOverview;
}
