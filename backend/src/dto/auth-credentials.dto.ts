import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class AuthCredentialsDto {
  @IsString()
  @IsEmail({}, { message: 'Incorrect email' })
  email: string

  @IsString()
  @MinLength(4)
  @MaxLength(30)
  password: string
}
