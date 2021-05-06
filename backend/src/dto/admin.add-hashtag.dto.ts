import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator'
import { TransactionType } from '../wallet/enum/TransactionType.enum'

export class HashtagAddToTsxDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  transactionID: number

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType

  @IsNotEmpty()
  text: string
}
