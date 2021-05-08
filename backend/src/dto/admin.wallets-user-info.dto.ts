import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'
import { ToBoolean } from 'src/helpers/ToBoolean'

export class GetUserWalletsInfo {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  userID: number

  @IsOptional()
  @ToBoolean()
  fullName: boolean

  @IsOptional()
  @ToBoolean()
  addresses: boolean

  @IsOptional()
  @ToBoolean()
  balancesSumm: boolean

  @IsOptional()
  @ToBoolean()
  balancesSummEur: boolean

  @IsOptional()
  @ToBoolean()
  transactions: boolean

  @IsOptional()
  @ToBoolean()
  balancesHistory: boolean
}
