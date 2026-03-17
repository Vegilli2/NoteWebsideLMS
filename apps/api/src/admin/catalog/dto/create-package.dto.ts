import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreatePackageDto {
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
  teacherHelpEnabled!: boolean;

  @IsBoolean()
  certificateEnabled!: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === "" || value === null || value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  trialDays?: number;

  @IsArray()
  @IsString({ each: true })
  courseIds!: string[];
}
