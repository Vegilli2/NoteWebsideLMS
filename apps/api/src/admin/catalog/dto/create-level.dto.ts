import { IsEnum, IsString, MinLength } from "class-validator";
import { LevelCode } from "../../../../../../generated/prisma";

export class CreateLevelDto {
  @IsEnum(LevelCode)
  code!: LevelCode;

  @IsString()
  @MinLength(2)
  title!: string;
}
