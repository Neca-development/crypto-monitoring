import { IsOptional } from 'class-validator'
import { ToBoolean } from 'src/helpers/ToBoolean'

export class GetWalletsStats {
  @IsOptional()
  @ToBoolean()
  ethBalanceSumm: boolean

  @IsOptional()
  @ToBoolean()
  ethBalanceSummEur: boolean

  @IsOptional()
  @ToBoolean()
  btcBalanceSumm: boolean

  @IsOptional()
  @ToBoolean()
  btcBalanceSummEur: boolean

  @IsOptional()
  @ToBoolean()
  erc20BalancesSummEur: boolean
}
