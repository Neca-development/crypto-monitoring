import { Type } from 'class-transformer'
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator'

export class EditUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  newFullName: string

  @IsOptional()
  @IsString()
  @MinLength(4)
  newPassword: string

  @IsOptional()
  @IsEmail()
  newEmail: string

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  userID: number
}
