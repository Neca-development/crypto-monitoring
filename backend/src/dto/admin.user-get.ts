import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'
import { ToBoolean } from 'src/helpers/ToBoolean'

export class GetUserDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  userID: number

  @IsOptional()
  @ToBoolean()
  fullName: boolean
}
