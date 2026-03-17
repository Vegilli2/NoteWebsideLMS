import { Injectable } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth/auth.service";
import { PrismaService } from "../prisma/prisma.service";

type PortalSummaryResponse =
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

@Injectable()
export class PortalService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async getSummary(request: Request): Promise<PortalSummaryResponse> {
    const session = await this.authService.getSessionUser(request);

    if (!session.authenticated) {
      return { authenticated: false };
    }

    if (session.localUser.status !== "synced") {
      return {
        authenticated: true,
        firebase: {
          uid: session.uid,
          email: session.email,
        },
        localUser: {
          status: "not_synced",
        },
        stats: {
          activePackages: 0,
          activeCourses: 0,
        },
        entitlements: [],
      };
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: session.localUser.userId,
      },
      include: {
        roleAssignments: true,
        entitlements: {
          orderBy: {
            startsAt: "desc",
          },
          include: {
            package: {
              include: {
                level: true,
                packageCourses: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        authenticated: true,
        firebase: {
          uid: session.uid,
          email: session.email,
        },
        localUser: {
          status: "not_synced",
        },
        stats: {
          activePackages: 0,
          activeCourses: 0,
        },
        entitlements: [],
      };
    }

    const entitlements = user.entitlements.map((entitlement) => ({
      id: entitlement.id,
      title: entitlement.package.title,
      description: entitlement.package.description,
      levelCode: entitlement.package.level.code,
      sourceType: entitlement.sourceType,
      teacherHelpEnabled: entitlement.teacherHelpEnabled,
      certificateEnabled: entitlement.certificateEnabled,
      startsAt: entitlement.startsAt.toISOString(),
      endsAt: entitlement.endsAt ? entitlement.endsAt.toISOString() : null,
      courseCount: entitlement.package.packageCourses.length,
      courses: entitlement.package.packageCourses.map((packageCourse) => ({
        id: packageCourse.course.id,
        slug: packageCourse.course.slug,
        title: packageCourse.course.title,
        description: packageCourse.course.description,
        levelCode: entitlement.package.level.code,
      })),
    }));

    const activeCourseCount = user.entitlements.reduce(
      (sum, entitlement) => sum + entitlement.package.packageCourses.length,
      0,
    );

    return {
      authenticated: true,
      firebase: {
        uid: session.uid,
        email: session.email,
      },
      localUser: {
        status: "synced",
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roleAssignments.map((assignment) => assignment.role),
      },
      stats: {
        activePackages: user.entitlements.length,
        activeCourses: activeCourseCount,
      },
      entitlements,
    };
  }
}
