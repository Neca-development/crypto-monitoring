import {
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { EntityRepository, In, Repository } from 'typeorm'
import { TransactionBtcModel } from '../entities/Transaction-btc.model'
import { WalletBTC } from '../entities/Wallet-btc.entity'
import { TransactionBTC } from '../entities/Transaction-btc.entity'
import { dbErrorCodes } from 'src/config/db-error-codes'

@EntityRepository(TransactionBTC)
export class BtcTransactionRepository extends Repository<TransactionBTC> {
  private readonly logger = new Logger(BtcTransactionRepository.name)

  async addTransactionsByModel(
    wallet: WalletBTC,
    transactions: TransactionBtcModel[]
  ) {
    let walletTransactions = await wallet.transactions

    transactions.forEach(async element => {
      let transaction = this.create()
      transaction.hash = element.hash
      transaction.time = element.time
      transaction.type = element.type
      transaction.from = element.from
      transaction.to = element.to
      transaction.value = element.value

      walletTransactions.push(transaction)
    })

    try {
      return await wallet.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        this.logger.error(`Duplicate transactions found`, e.stack)
        this.logger.error(walletTransactions)
        throw new ConflictException(`Duplicate transacions found`)
      }
      this.logger.error(`Cannot add transactions to db`, e.stack)
      this.logger.error(walletTransactions)
      throw new InternalServerErrorException('Cannot add transactions')
    }
  }
  /*
    TODO
    Реализовать адекватный запрос
  */

  async getLastTsxHash(wallet: WalletBTC) {
    let transactions = await wallet.transactions

    if (!transactions.length) {
      return 'No transactions found'
    }

    return transactions[transactions.length - 1].hash
  }

  async getTransactionsByIds(ids: Number[]) {
    const results = await this.find({
      where: { wallet: { id: In(ids) } },
      order: { time: 'ASC' },
      loadEagerRelations: false
    })

    return results
  }
}
