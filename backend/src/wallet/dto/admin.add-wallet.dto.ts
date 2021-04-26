import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsString } from 'class-validator'
import { WalletType } from '../enum//WalletType.enum'

export class AddWalletDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  userID: number

  @IsNotEmpty()
  @IsString()
  address: string

  @IsNotEmpty()
  type: WalletType
}
