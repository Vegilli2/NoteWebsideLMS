import { IsBoolean, IsString, MinLength } from "class-validator";

export class CreateCourseDto {
  @IsString()
  @MinLength(1)
  levelId!: string;

  @IsString()
  @MinLength(2)
  slug!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(2)
  description!: string;

  @IsBoolean()
  isPublished!: boolean;
}
