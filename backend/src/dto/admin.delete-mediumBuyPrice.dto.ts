import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator'
import { WalletType } from 'src/wallet/enum/WalletType.enum'

export class DeleteMediumBuyPriceDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  walletID: number

  @IsNotEmpty()
  @IsEnum(WalletType)
  type: WalletType
}