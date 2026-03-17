import { IsString, MinLength } from "class-validator";

export class CreateSessionDto {
  @IsString()
  @MinLength(100)
  idToken!: string;
}
