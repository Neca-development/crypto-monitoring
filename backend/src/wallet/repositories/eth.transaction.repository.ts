import {
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { EntityRepository, In, Repository } from 'typeorm'
import { TransactionETH } from '../entities/Transaction-eth.entity'
import { TransactionEthModel } from '../interfaces/Transaction-eth.model'
import { WalletETH } from '../entities/Wallet-eth.entity'
import { NumToEth } from '../../helpers/NumToEth'
import { dbErrorCodes } from 'src/config/db-error-codes'
import moment from 'moment'

@EntityRepository(TransactionETH)
export class EthTransactionRepository extends Repository<TransactionETH> {
  private readonly logger = new Logger(EthTransactionRepository.name)

  /*
    Добавление новых транзакций к кошельку по модели
    В случае если транзакция с переданым хешем уже существует выбросит conflict
  */

  async addTransactionsByModel(
    wallet: WalletETH,
    transactions: TransactionEthModel[]
  ): Promise<WalletETH> {
    const walletTransactions = await wallet.transactions

    transactions.forEach(async element => {
      if (element.type === false) {
        element.value = -Math.abs(element.value)
      }
      const transaction = this.create()
      transaction.hash = element.hash
      transaction.time = element.time
      transaction.type = element.type
      transaction.from = element.from
      transaction.to = element.to
      transaction.value = NumToEth(element.value)
      transaction.fee = element.fee

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
    Получение хеша последней транзакции по кошельку
  */

  async getLastTsxHash(wallet: WalletETH): Promise<string> {
    const transactions = await wallet.transactions

    if (!transactions.length) {
      return 'No transactions found'
    }

    return transactions[transactions.length - 1].hash
  }

  /*
    Получение транзакций по айдишникам кошельков
    Так-же происходит сортировка по времени ASC
  */

  async getTransactionsByWalletIds(
    walletIds: number[],
    options?: { hashtags?: boolean }
  ): Promise<TransactionETH[]> {
    const query = this.createQueryBuilder('transaction')
    const selections = ['transaction']

    if(!walletIds.length) return []
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

    if(!walletIds.length) return []

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

    this.logger.debug(`Result of eth:getSumOfWalletsFees query is`)
    console.log(summs)
    return summs as [{ date: string; value: number }]
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
    
    if(!walletIds.length) return []

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

    this.logger.debug(`Result of getSumOfWalletsTsxByDays query is`)
    console.log(summs)
    return summs as [{ date: string; value: number }]
  }
}
