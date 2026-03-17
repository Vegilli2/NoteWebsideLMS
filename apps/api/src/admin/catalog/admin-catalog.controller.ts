import { Body, Controller, Get, Post } from "@nestjs/common";
import { AdminCatalogService } from "./admin-catalog.service";
import { AssignPackageDto } from "./dto/assign-package.dto";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CreateLevelDto } from "./dto/create-level.dto";
import { CreatePackageDto } from "./dto/create-package.dto";

@Controller("admin/catalog")
export class AdminCatalogController {
  private static serviceRef: AdminCatalogService;

  constructor(service: AdminCatalogService) {
    AdminCatalogController.serviceRef = service;
  }

  @Get("overview")
  getOverview() {
    return AdminCatalogController.serviceRef.getOverview();
  }

  @Post("levels")
  createLevel(@Body() input: CreateLevelDto) {
    return AdminCatalogController.serviceRef.createLevel(input);
  }

  @Post("courses")
  createCourse(@Body() input: CreateCourseDto) {
    return AdminCatalogController.serviceRef.createCourse(input);
  }

  @Post("packages")
  createPackage(@Body() input: CreatePackageDto) {
    return AdminCatalogController.serviceRef.createPackage(input);
  }

  @Post("assign-package")
  assignPackage(@Body() input: AssignPackageDto) {
    return AdminCatalogController.serviceRef.assignPackage(input);
  }
}
