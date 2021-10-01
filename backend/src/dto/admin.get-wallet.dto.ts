import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ToBoolean } from 'src/helpers/ToBoolean'
import { WalletType } from '../wallet/enum/WalletType.enum'

export class GetWalletDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  walletID: number

  @IsNotEmpty()
  @IsString()
  type: WalletType

  @IsOptional()
  @ToBoolean()
  holderName: boolean

  @IsOptional()
  @ToBoolean()
  transactions: boolean

  @IsOptional()
  @ToBoolean()
  hashtags: boolean

  @IsOptional()
  @ToBoolean()
  balanceInEur: boolean

  @IsOptional()
  @ToBoolean()
  balanceHistory: boolean

  @IsOptional()
  @ToBoolean()
  erc20tokens: boolean
}
