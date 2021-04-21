import {
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { EntityRepository, In, Repository } from 'typeorm'
import { TransactionBtcModel } from '../interfaces/Transaction-btc.model'
import { WalletBTC } from '../entities/Wallet-btc.entity'
import { TransactionBTC } from '../entities/Transaction-btc.entity'
import { dbErrorCodes } from 'src/config/db-error-codes'

@EntityRepository(TransactionBTC)
export class BtcTransactionRepository extends Repository<TransactionBTC> {
  private readonly logger = new Logger(BtcTransactionRepository.name)

  /*
    Добавление новых транзакций к кошельку по модели
    В случае если транзакция с переданым хешем уже существует выбросит conflict
    Возвращает кошель с транзакциями
  */

  async addTransactionsByModel(
    wallet: WalletBTC,
    transactions: TransactionBtcModel[]
  ): Promise<WalletBTC> {
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
    Получение хеша последней (Самой свежей) транзакции по кошельку
  */

  async getLastTsxHash(wallet: WalletBTC): Promise<string> {
    let transactions = await wallet.transactions

    if (!transactions.length) {
      return 'No transactions found'
    }

    return transactions[transactions.length - 1].hash
  }

  /*
    Получение транзакций по айдишникам кошельков
    Так-же происходит сортировка по времени ASC
  */

  async getTransactionsByIds(ids: Number[]): Promise<TransactionBTC[]> {
    const results = await this.find({
      where: { wallet: { id: In(ids) } },
      order: { time: 'ASC' },
      loadEagerRelations: false
    })

    return results
  }
}
