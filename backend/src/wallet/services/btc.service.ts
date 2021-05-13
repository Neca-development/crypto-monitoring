import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'
import { BtcRepository } from '../repositories/btc.repository'
import { BtcTransactionRepository } from '../repositories/btc.transaction.repository'
import { BtcWalletProviderService } from './btc.wallet-provider.service'
import { IGetUserWalletsInfo } from '../interfaces/IGetInfoByUser.props'
import { WalletBTC } from '../entities/Wallet-btc.entity'
import { WalletBtcModel } from '../interfaces/Wallet-btc.model'
import moment from 'moment'
import { User } from 'src/auth/user/user.entity'

@Injectable()
export class BtcService {
  private readonly logger = new Logger(BtcService.name)
  constructor(
    private btcWalletProviderService: BtcWalletProviderService,
    @InjectRepository(BtcTransactionRepository)
    private btcTransactionRepository: BtcTransactionRepository,
    @InjectRepository(BtcRepository)
    private btcRepository: BtcRepository
  ) {}

  /*
    Создание нового кошелька

    Делегирует логику получения данных о кошельке провайдеру
    Затем по полученной от провайдера модели создаёт кошель в бд
    И добавляет к кошельку транзакции, по полученным от провайдера моделям

    Затем возвращает кошелёк с транзакциями
  */

  async createWallet(address: string): Promise<WalletBTC> {
    let walletModel: WalletBtcModel = await this.btcWalletProviderService.getBtcWallet(
      address
    )

    let wallet: WalletBTC = await this.btcRepository.addWaletByModel({
      address: walletModel.address,
      balance: walletModel.balance
    })

    let walletWithTransactions: WalletBTC = await this.btcTransactionRepository.addTransactionsByModel(
      wallet,
      walletModel.transactions
    )

    return walletWithTransactions
  }

  async getWalletsSummBalance(): Promise<Number> {
    return await this.btcRepository.getBalanceSumm()
  }

  async deleteWallet(walletID: number): Promise<WalletBTC> {
    return await this.btcRepository.deleteWalletById(walletID)
  }

  async getWallet(props: IGetWalletProps) {
    return await this.btcRepository.getWallet(props)
  }

  /*
    Получение информации о конкретном пользователе
    В интерфейсе указывается какие именно необходимо получить данные
    В основном делегирует логику репозиториям
  */

  async getInfoByUser(props: IGetUserWalletsInfo) {
    let result: any = {}

    if (props.totalBalance) {
      result.totalBalance = await this.btcRepository.getUserBalanceSumm(
        props.user
      )
    }

    if (props.addresses) {
      result.addresses = await this.btcRepository.getUserAdresses(props.user)
    }

    if (props.transactions) {
      // TODO
      // Оптимизировать запрос

      let userWallets = await props.user.btcWallets

      let walletsIds = userWallets.map(wallet => wallet.id)

      result.transactions = await this.btcTransactionRepository.getTransactionsByWalletIds(
        walletsIds,
        { hashtags: true }
      )
    }

    return result
  }

  /*
    Получение отчета по истории баланса кошелька за последние n дней
    Возвращает массив по типу
    {
      date: '2021-03-20'
      value: 666
    }
  */

  async getWalletBalanceHistory(
    days,
    wallet: WalletBTC
  ): Promise<{ date: string; value: number }[]> {
    let tsxSums = await this.btcTransactionRepository.getSumOfWalletsTsxByDays(
      days,
      [wallet.id]
    )
    const feesSumm = await this.btcTransactionRepository.getSumOfWalletsFees(
      days,
      [wallet.id]
    )

    const balanceHistory = this.calculateBalanceHistory(
      +wallet.balance,
      days,
      tsxSums,
      feesSumm
    )
    return balanceHistory
  }

  /*
    Получение отчета по истории суммы балансов всех кошельков пользователя за последние n дней
    Возвращает массив по типу
    {
      date: '2021-03-20'
      value: 666
    }
  */

  async getUserBalanceHistory(
    days: number,
    user: User
  ): Promise<{ date: string; value: number }[]> {
    let totalBalance = await this.btcRepository.getUserBalanceSumm(user)
    totalBalance = +totalBalance
    const wallets = await user.btcWallets
    if (!wallets.length) {
      return []
    }
    const walletIds = wallets.map(wallet => wallet.id)
    let tsxSums = await this.btcTransactionRepository.getSumOfWalletsTsxByDays(
      days,
      walletIds
    )
    const feesSum = await this.btcTransactionRepository.getSumOfWalletsFees(
      days,
      walletIds
    )

    let balanceHistory = this.calculateBalanceHistory(
      totalBalance,
      days,
      tsxSums,
      feesSum
    )

    return balanceHistory
  }

  /*
    Метод отвечающий за вычисления по истории балансов
    Возвращает массив по типу
    {
      date: '2021-03-20'
      value: 666
    }
  */

  private calculateBalanceHistory(
    balanceNow: number,
    days: number,
    tsxSums: { date: string; value: number }[],
    feesSum: { date: string; value: number }[]
  ): { date: string; value: number }[] {
    const txnSumMap: Map<string, number> = new Map()
    const feesMap: Map<string, number> = new Map()

    tsxSums.forEach(sum => {
      txnSumMap.set(sum.date, sum.value)
    })

    feesSum.forEach(sum => {
      feesMap.set(sum.date, +sum.value)
    })

    this.logger.debug(`Map is`)
    console.log(txnSumMap)

    const balanceHistory = [
      {
        date: moment().format('YYYY-MM-DD'),
        value: balanceNow
      }
    ]

    for (let i = 1; i < days; i++) {
      const todayDate = moment().subtract(i, 'days').format('YYYY-MM-DD')
      const yesterdayDate = moment()
        .subtract(i - 1, 'days')
        .format('YYYY-MM-DD')
      const txnSumYesterday = txnSumMap.get(yesterdayDate)

      const value = balanceHistory[i - 1]
      let balance = value.value

      if (txnSumYesterday) {
        balance = balance - txnSumYesterday
      }

      // const fee = feesMap.get(yesterdayDate)
      // this.logger.debug(`Fee summ is ${balance}`)
      // if (fee) {
      //   balance -= fee
      // }

      const record: { date: string; value: number } = {
        date: todayDate,
        value: balance
      }

      balanceHistory.push(record)
    }

    this.logger.debug(`balanceHistory btc report is`)
    console.log(balanceHistory)

    return balanceHistory
  }
}
