import { IsNotEmpty, IsString } from 'class-validator'

export class AddClientDto {
  @IsString()
  @IsNotEmpty()
  fullName: string
}
