import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { TransactionType } from 'src/wallet/enum/TransactionType.enum'

export class HashtagEditDto {
    @IsNotEmpty()
    @Type(() => Number)
    @IsInt()
    hashtagID: number

    @IsNotEmpty()
    @IsEnum(TransactionType)
    type: TransactionType

    @IsOptional()
    @IsString()
    newText: string
}
