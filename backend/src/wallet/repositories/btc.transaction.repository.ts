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
import moment from 'moment'

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
      if (element.type === false) {
        element.value = -Math.abs(element.value)
      }
      transaction.hash = element.hash
      transaction.time = element.time
      transaction.type = element.type
      transaction.from = element.from
      transaction.to = element.to
      transaction.value = element.value
      //TODO
      // Сейчас решение костыльное
      transaction.fee = 0.0003

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

    let query = this.createQueryBuilder('transaction')
    query.where('transaction.walletId = :walletID', { walletID: wallet.id })
    query.orderBy('transaction.time', 'DESC')
    query.select('transaction.hash')

    let result = await query.getOne()

    if (!result) {
      return 'No transactions found'
    }

    console.log(result)

    return result.hash
  }

  /*
    Получение транзакций по айдишникам кошельков
    Так-же происходит сортировка по времени ASC
  */

  /*
  Получение транзакций по айдишникам кошельков
  Так-же происходит сортировка по времени ASC
*/

  async getTransactionsByWalletIds(
    walletIds: number[],
    options?: { hashtags?: boolean }
  ): Promise<TransactionBTC[]> {
    const query = this.createQueryBuilder('transaction')
    const selections = ['transaction']

    if (!walletIds.length) return []

    query
      .innerJoin('transaction.wallet', 'wallet')
      .where('wallet.id in (:...walletIds)', { walletIds })
      .orderBy('transaction.time', 'ASC')

    if (options && options.hashtags) {
      query.leftJoin('transaction.hashtags', 'hashtags')
      selections.push('hashtags')
    }

    query.select(selections)

    const results = await query.getMany()

    return results
  }

  async getTransactionById(id: number) {
    return await this.findOne({ id })
  }

  /*
  Отчёт
  Показывает на какую сумму были транзакции по дням
  Значения возвращаются на последние n дней
  Сумма возвращается number-ом, включая отрицатльные значения
  Возвращает массив по типу

  date: 2021-03-21
  value: -666
*/

  async getSumOfWalletsTsxByDays(
    days: number,
    walletIds: number[]
  ): Promise<{ date: string; value: number }[]> {
    if (!walletIds.length) return []

    this.logger.debug(`Walltids`)
    console.log(walletIds)
    const query = this.createQueryBuilder('transaction')
    query
      .select("date_trunc('day', transaction.time)::timestamp as date")
      .addSelect('SUM(transaction.value) as value')
      .where(`transaction.time > (CURRENT_DATE - INTERVAL \'${days} DAY\')`)
      .andWhere('transaction.walletId IN (:...walletIds)', { walletIds })
      .orderBy("date_trunc('day', transaction.time)::timestamp", 'ASC')
      .groupBy("date_trunc('day', transaction.time)::timestamp")

    const summs = await query.getRawMany()

    summs.forEach(sum => {
      sum.date = moment(sum.date).format('YYYY-MM-DD')
      sum.value = +sum.value
    })

    this.logger.debug(`Result of btc:getSumOfWalletsTsxByDays query is`)
    console.log(summs)
    return summs as [{ date: string; value: number }]
  }

  /*
    Отчёт
    Показывает сумму комиссий оплаченных кошельками
    Значения возвращаются на последние n дней
    Сумма возвращается number-ом
    Возвращает массив по типу

    date: 2021-03-21
    value: 666
  */

  async getSumOfWalletsFees(
    days: number,
    walletIds: number[]
  ): Promise<{ date: string; value: number }[]> {
    if (!walletIds.length) return []

    const query = this.createQueryBuilder('transaction')
    query
      .select("date_trunc('day', transaction.time)::timestamp as date")
      .addSelect('SUM(transaction.fee) as value')
      .where(`transaction.time > (CURRENT_DATE - INTERVAL \'${days} DAY\')`)
      .andWhere(`transaction.type = false`)
      .andWhere('transaction.walletId IN (:...walletIds)', { walletIds })
      .orderBy("date_trunc('day', transaction.time)::timestamp", 'ASC')
      .groupBy("date_trunc('day', transaction.time)::timestamp")

    const summs = await query.getRawMany()

    summs.forEach(sum => {
      sum.date = moment(sum.date).format('YYYY-MM-DD')
      sum.value = +sum.value
    })

    this.logger.debug(`Result of btc:getSumOfWalletsFees query is`)
    console.log(summs)
    return summs
  }
}
