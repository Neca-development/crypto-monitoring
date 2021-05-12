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
import moment from 'moment'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'

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

  //   Promise<
  //   {
  //     id: number
  //     type: boolean
  //     hash: string
  //     from: string
  //     to: string
  //     time: Date
  //     value: string
  //     token_symbol: string
  //     token_name: string
  //   }[]
  // >

  async getTsxsWithTokenTypes(tokenIds: number[], hashtags: boolean = true): Promise<IERC20TsxWithTokenType[]> {
    if (!tokenIds.length) return []

    const selections = ['transaction', 'token', 'type']

    let query = this.createQueryBuilder('transaction')
    query
      .where('transaction.tokenId IN (:...tokenIds)', { tokenIds })
      .innerJoin('transaction.token', 'token')
      .innerJoin('token.type', 'type')

    if (hashtags) {
      query.leftJoin('transaction.hashtags', 'hashtags')
      selections.push('hashtags')
    }

    query.select(selections)
    let result: any = await query.getMany()

    result.forEach(txn => {
      txn.token_symbol = txn.token.type.symbol
      txn.token_name = txn.token.type.name
      delete txn.token
    })

    return result
  }

  async getUserTsxsWithTokenTypes(
    userID: number,
    hashtags: boolean = true
  ): Promise<IERC20TsxWithTokenType[]> {
    if (!userID) return []

    const selections = ['transaction', 'token', 'type']

    let query = this.createQueryBuilder('transaction')
    query
      .innerJoin('transaction.token', 'token')
      .innerJoin('token.type', 'type')
      .innerJoin('token.wallet', 'wallet')
      .where('wallet.userId = :userID', { userID })

    if (hashtags) {
      query.leftJoin('transaction.hashtags', 'hashtags')
      selections.push('hashtags')
    }

    query.select(selections)
    let result: any = await query.getMany()

    result.forEach(txn => {
      txn.token_symbol = txn.token.type.symbol
      txn.token_name = txn.token.type.name
      delete txn.token
    })

    return result
  }

  async getSumOfWalletsFees(
    days: number,
    walletIds: number[]
  ): Promise<{ date: string; value: number }[]> {
    if (!walletIds.length) return []

    this.logger.debug(`Wallet ids in getSumOfWalletsFees`)
    console.log(walletIds)
    const query = this.createQueryBuilder('transaction')
    query
      .innerJoin('transaction.token', 'token')
      .innerJoin('token.wallet', 'awllet')
      .select("date_trunc('day', transaction.time)::timestamp as date")
      .addSelect('SUM(transaction.fee) as value')
      .where(`transaction.time > (CURRENT_DATE - INTERVAL \'${days} DAY\')`)
      .andWhere(`transaction.type = false`)
      .andWhere('token.walletId IN (:...walletIds)', { walletIds })
      .orderBy("date_trunc('day', transaction.time)::timestamp", 'ASC')
      .groupBy("date_trunc('day', transaction.time)::timestamp")

    const summs = await query.getRawMany()

    summs.forEach(sum => {
      sum.date = moment(sum.date).format('YYYY-MM-DD')
      sum.value = +sum.value
    })

    this.logger.debug(`Result of erc20.getSumOfWalletsFees query is`)
    this.logger.debug(JSON.stringify(summs))
    return summs as [{ date: string; value: number }]
  }
}
