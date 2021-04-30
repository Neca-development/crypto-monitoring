import {
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { dbErrorCodes } from 'src/config/db-error-codes'
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
    transaction.hash = tsxModel.hash
    transaction.time = tsxModel.time
    transaction.type = tsxModel.type
    transaction.from = tsxModel.from
    transaction.to = tsxModel.to
    transaction.value = tsxModel.value

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
      transaction.hash = tsxModel.hash
      transaction.time = tsxModel.time
      transaction.type = tsxModel.type
      transaction.from = tsxModel.from
      transaction.to = tsxModel.to
      transaction.value = tsxModel.value

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
}
