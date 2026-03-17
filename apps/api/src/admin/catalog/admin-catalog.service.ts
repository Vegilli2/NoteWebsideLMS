import { Injectable, NotFoundException } from "@nestjs/common";
import { EntitlementSourceType, UserRole } from "../../../../../generated/prisma";
import { PrismaService } from "../../prisma/prisma.service";
import { AssignPackageDto } from "./dto/assign-package.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CreateLevelDto } from "./dto/create-level.dto";
import { CreatePackageDto } from "./dto/create-package.dto";

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [levels, courses, packages, users] = await Promise.all([
      this.prisma.level.findMany({
        orderBy: {
          code: "asc",
        },
        include: {
          courses: true,
          packages: true,
        },
      }),
      this.prisma.course.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          level: true,
        },
      }),
      this.prisma.package.findMany({
        orderBy: {
          title: "asc",
        },
        include: {
          level: true,
          packageCourses: {
            include: {
              course: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          entitlements: {
            include: {
              package: true,
            },
          },
        },
      }),
    ]);

    return {
      levelCodeOptions: ["A1", "A2", "B1", "B2", "C1"],
      levels: levels.map((level) => ({
        id: level.id,
        code: level.code,
        title: level.title,
        courseCount: level.courses.length,
        packageCount: level.packages.length,
      })),
      courses: courses.map((course) => ({
        id: course.id,
        levelId: course.levelId,
        levelCode: course.level.code,
        slug: course.slug,
        title: course.title,
        description: course.description,
        isPublished: course.isPublished,
      })),
      packages: packages.map((pkg) => ({
        id: pkg.id,
        levelId: pkg.levelId,
        levelCode: pkg.level.code,
        slug: pkg.slug,
        title: pkg.title,
        description: pkg.description,
        teacherHelpEnabled: pkg.teacherHelpEnabled,
        certificateEnabled: pkg.certificateEnabled,
        trialDays: pkg.trialDays,
        courseTitles: pkg.packageCourses.map((packageCourse) => packageCourse.course.title),
      })),
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        entitlementTitles: user.entitlements.map((entitlement) => entitlement.package.title),
      })),
    };
  }

  async createLevel(input: CreateLevelDto) {
    return this.prisma.level.create({
      data: {
        code: input.code,
        title: input.title.trim(),
      },
    });
  }

  async createCourse(input: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        levelId: input.levelId,
        slug: input.slug.trim().toLowerCase(),
        title: input.title.trim(),
        description: input.description.trim(),
        isPublished: input.isPublished,
      },
    });
  }

  async createPackage(input: CreatePackageDto) {
    return this.prisma.package.create({
      data: {
        levelId: input.levelId,
        slug: input.slug.trim().toLowerCase(),
        title: input.title.trim(),
        description: input.description.trim(),
        teacherHelpEnabled: input.teacherHelpEnabled,
        certificateEnabled: input.certificateEnabled,
        trialDays: input.trialDays,
        packageCourses: {
          create: input.courseIds.map((courseId) => ({
            courseId,
          })),
        },
      },
      include: {
        packageCourses: true,
      },
    });
  }

  async assignPackage(input: AssignPackageDto) {
    const normalizedEmail = input.email.toLowerCase().trim();
    const packageRecord = await this.prisma.package.findUnique({
      where: {
        id: input.packageId,
      },
    });

    if (!packageRecord) {
      throw new NotFoundException("Package not found.");
    }

    let user = await this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      include: {
        roleAssignments: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          fullName: this.deriveFullName(normalizedEmail),
          locale: "nb",
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
    }

    const existingEntitlement = await this.prisma.entitlement.findFirst({
      where: {
        userId: user.id,
        packageId: packageRecord.id,
        endsAt: null,
      },
    });

    if (existingEntitlement) {
      return {
        status: "already_assigned",
        entitlementId: existingEntitlement.id,
        userEmail: user.email,
        packageTitle: packageRecord.title,
      };
    }

    const entitlement = await this.prisma.entitlement.create({
      data: {
        userId: user.id,
        packageId: packageRecord.id,
        sourceType: EntitlementSourceType.ADMIN_GRANT,
        sourceRef: "admin-manual-grant",
        teacherHelpEnabled: packageRecord.teacherHelpEnabled,
        certificateEnabled: packageRecord.certificateEnabled,
      },
    });

    return {
      status: "assigned",
      entitlementId: entitlement.id,
      userEmail: user.email,
      packageTitle: packageRecord.title,
    };
  }

  private deriveFullName(email: string) {
    const localPart = email.split("@")[0] ?? "Student";
    return localPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
