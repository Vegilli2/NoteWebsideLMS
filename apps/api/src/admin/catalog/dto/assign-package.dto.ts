import { IsEmail, IsString, MinLength } from "class-validator";

export class AssignPackageDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  packageId!: string;
}
