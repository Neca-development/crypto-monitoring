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
  ) { }

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
  Получение отчета по сумме балансов кошелька за последние n дней
  Возвращает массив по типу
  {
    date: '2021-03-20'
    value: 666
  }
*/

  async getWalletBalanceStats(days, wallet: WalletBTC) {
    let totalBalance = +wallet.balance
    let summs = await this.btcTransactionRepository.getSumOfWalletsTsxByDays(days, [wallet])

    if (!summs.length) {
      return []
    }

    const summsMap: Map<string, number> = new Map()

    summs.forEach(sum => {
      summsMap.set(sum.date, sum.value)
    })

    console.log(`Map is`)
    console.log(summsMap)

    const summsReport = [{
      date: moment().format('YYYY-MM-DD'),
      value: totalBalance
    }]

    for (let i = 1; i < days; i++) {

      const date = moment().subtract(i, 'days').format('YYYY-MM-DD')
      const sumForDay = summsMap.get(date)
      if (sumForDay) {
        if (sumForDay > 0) {
          totalBalance += sumForDay
        } else {
          totalBalance -= sumForDay
        }
      }

      if (totalBalance < 0) {
        this.logger.debug(`Balance < 0.01 found :${totalBalance}`)
        totalBalance = 0
      }

      const record: any = {
        date,
        value: totalBalance
      }


      summsReport.push(record)
    }

    return summsReport
  }

  /*
Получение отчета по сумме балансов всех eth кошельков пользователя за последние n дней
Возвращает массив по типу
{
  date: '2021-03-20'
  value: 666
}
*/


  async getUserBalanceStats(days: number, user: User) {
    let totalBalance = await this.btcRepository.getUserBalanceSumm(user)
    totalBalance = +totalBalance
    const wallets = await user.btcWallets

    if (!wallets.length) {
      return []
    }

    const summs = await this.btcTransactionRepository.getSumOfWalletsTsxByDays(days, wallets)

    if (!summs.length) {
      return []
    }

    const summsMap: Map<string, number> = new Map()

    summs.forEach(sum => {
      summsMap.set(sum.date, sum.value)
    })

    const summsReport = [{
      date: moment().format('YYYY-MM-DD'),
      value: totalBalance
    }]

    for (let i = 1; i < days; i++) {

      const date = moment().subtract(i, 'days').format('YYYY-MM-DD')
      const sumForDay = summsMap.get(date)
      if (sumForDay) {
        totalBalance += sumForDay
      }

      if (totalBalance < 0) {
        this.logger.debug(`Balance < 0.01 found :${totalBalance}`)
        totalBalance = 0
      }

      const record: any = {
        date,
        value: totalBalance
      }


      summsReport.push(record)
    }

    return summsReport
  }
}
