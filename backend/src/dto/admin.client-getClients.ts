import { IsOptional } from 'class-validator'
import { ToBoolean } from 'src/helpers/ToBoolean'

export class GetClientsDto {
  @IsOptional()
  @ToBoolean()
  fullName: boolean
}
