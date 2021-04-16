import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ToBoolean } from 'src/helpers/ToBoolean'
import { WalletType } from '../wallet/enum/WalletType.enum'

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
}
