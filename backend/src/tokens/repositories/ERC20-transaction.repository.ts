import {
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { dbErrorCodes } from 'src/config/db-error-codes'
import { IERC20TsxWithTokenType } from '../SubTypes/IERC20TsxWithTokenType'
import { EntityRepository, Repository } from 'typeorm'
import { ERC20Token } from '../entities/ERC20-token.entity'
import { ERC20Transaction } from '../entities/ERC20-transaction.entity'
import { IERC20TranscationModel } from '../interfaces/IERC20Transaction'

// TODO
// Потестить можно ли не запрашивать транзакции у токена
// А просто присвоить транзакции токен
@EntityRepository(ERC20Transaction)
export class ERC20TransactionRepository extends Repository<ERC20Transaction> {
  private readonly logger = new Logger(ERC20TransactionRepository.name)

  async addTransactionByModel(
    tsxModel: IERC20TranscationModel,
    token: ERC20Token
  ) {
    let tokenTransactions = await token.transactions

    let transaction = this.create()
    if (tsxModel.type === false) {
      tsxModel.value = -Math.abs(tsxModel.value)
    }
    transaction.hash = tsxModel.hash
    transaction.time = tsxModel.time
    transaction.type = tsxModel.type
    transaction.from = tsxModel.from
    transaction.to = tsxModel.to
    transaction.value = tsxModel.value
    transaction.fee = tsxModel.fee

    tokenTransactions.push(transaction)

    try {
      return await token.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        this.logger.error(`Duplicate transactions found`, e.stack)
        this.logger.error(tokenTransactions)
        throw new ConflictException(`Duplicate transacions found`)
      }
      this.logger.error(`Cannot add transactions to db`, e.stack)
      this.logger.error(tokenTransactions)
      throw new InternalServerErrorException('Cannot add transactions')
    }
  }

  async addTransactionsByModel(
    transactions: IERC20TranscationModel[],
    token: ERC20Token
  ): Promise<ERC20Token> {
    let tokenTransactions = await token.transactions

    transactions.forEach(async tsxModel => {
      let transaction = this.create()
      if (tsxModel.type === false) {
        tsxModel.value = -Math.abs(tsxModel.value)
      }
      transaction.hash = tsxModel.hash
      transaction.time = tsxModel.time
      transaction.type = tsxModel.type
      transaction.from = tsxModel.from
      transaction.to = tsxModel.to
      transaction.value = tsxModel.value
      transaction.fee = tsxModel.fee

      tokenTransactions.push(transaction)
    })

    try {
      return await token.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        this.logger.error(`Duplicate transactions found`, e.stack)
        this.logger.error(tokenTransactions)
        throw new ConflictException(`Duplicate transacions found`)
      }
      this.logger.error(`Cannot add transactions to db`, e.stack)
      this.logger.error(tokenTransactions)
      throw new InternalServerErrorException('Cannot add transactions')
    }
  }

  async getTransactionById(id: number) {
    return await this.findOne({ id })
  }

  /*
    Получение транзакций вместе с названием и символом токена
    По id кошельков
  */

  async getTsxsWithTokenTypes(
    tokenIds: number[]
  ): Promise<
    {
      id: number
      type: boolean
      hash: string
      from: string
      to: string
      time: Date
      value: string
      token_symbol: string
      token_name: string
    }[]
  > {
    if (!tokenIds.length) return []
    
    let query = this.createQueryBuilder('transaction')
    query
      .where('transaction.tokenId IN (:...tokenIds)', { tokenIds })
      .innerJoin('transaction.token', 'token')
      .innerJoin('token.type', 'type')
      .select('transaction.id as id')
      .addSelect('transaction.type as type')
      .addSelect('transaction.hash as hash')
      .addSelect('transaction.from as from')
      .addSelect('transaction.to as to')
      .addSelect('transaction.time as time')
      .addSelect('transaction.value as value')
      .addSelect('type.symbol as token_symbol')
      .addSelect('type.name as token_name')

    return await query.getRawMany()
  }

  async getUserTsxsWithTokenTypes(
    userID: number
  ): Promise<IERC20TsxWithTokenType[]> {
    let query = this.createQueryBuilder('transaction')
    query
      .innerJoin('transaction.token', 'token')
      .innerJoin('token.type', 'type')
      .innerJoin('token.wallet', 'wallet')
      .where('wallet.userId = :userID', { userID })
      .select('transaction.id as id')
      .addSelect('transaction.type as type')
      .addSelect('transaction.hash as hash')
      .addSelect('transaction.from as from')
      .addSelect('transaction.to as to')
      .addSelect('transaction.time as time')
      .addSelect('transaction.value as value')
      .addSelect('type.symbol as token_symbol')
      .addSelect('type.name as token_name')

    return await query.getRawMany()
  }
}
