import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty } from 'class-validator'
import { TransactionType } from '../wallet/enum/TransactionType.enum'

export class HashtagDeleteDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  hashtagID: number

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType
}
