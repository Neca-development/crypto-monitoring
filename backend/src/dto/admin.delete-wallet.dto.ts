import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsString } from 'class-validator'
import { WalletType } from '../wallet/enum/WalletType.enum'

export class DeleteWalletDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  walletID: number

  @IsNotEmpty()
  @IsString()
  type: WalletType
}
