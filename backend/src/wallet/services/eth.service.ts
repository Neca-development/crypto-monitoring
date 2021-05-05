import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import moment from 'moment'
import { User } from 'src/auth/user/user.entity'
import { ERC20TokenService } from 'src/tokens/services/erc20-token.service'
import { WalletETH } from '../entities/Wallet-eth.entity'
import { IGetUserWalletsInfo } from '../interfaces/IGetInfoByUser.props'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'
import { EthRepository } from '../repositories/eth.repository'
import { EthTransactionRepository } from '../repositories/eth.transaction.repository'
import { EthWalletProviderService } from './eth.wallet-provider.service'

@Injectable()
export class EthService {
  private logger = new Logger(EthService.name)

  constructor(
    private walletProviderService: EthWalletProviderService,
    private erc20tokenservice: ERC20TokenService,
    @InjectRepository(EthTransactionRepository)
    private ethTsxRepository: EthTransactionRepository,
    @InjectRepository(EthRepository)
    private ethRepository: EthRepository
  ) { }

  /*
    Создание нового кошелька

    Делегирует логику получения данных о кошельке провайдеру
    Затем по полученной от провайдера модели создаёт кошель в бд
    И добавляет к кошельку транзакции, по полученным от провайдера моделям

    Затем возвращает кошелёк с транзакциями
  */

  async createWallet(address: string): Promise<WalletETH> {
    const walletModel = await this.walletProviderService.getEthWallet(address)
    const wallet = await this.ethRepository.addWaletByModel({
      address: walletModel.address,
      balance: walletModel.balance
    })

    const walletWithTransactions: WalletETH = await this.ethTsxRepository.addTransactionsByModel(
      wallet,
      walletModel.transactions
    )

    const walletWithTokens: any = await this.erc20tokenservice.checkAndAddWalletTokens(
      wallet
    )

    return walletWithTokens
  }

  async getWalletsSummBalance(): Promise<number> {
    return await this.ethRepository.getBalanceSumm()
  }

  async deleteWallet(walletID: number): Promise<WalletETH> {
    return await this.ethRepository.deleteWalletById(walletID)
  }

  async getWallet(props: IGetWalletProps): Promise<WalletETH> {
    return await this.ethRepository.getWallet(props)
  }

  /*
    Получение информации о конкретном пользователе
    В интерфейсе указывается какие именно необходимо получить данные
    В основном делегирует логику репозиториям
  */

  async getInfoByUser(props: IGetUserWalletsInfo) {
    const result: any = {}

    if (props.totalBalance) {
      result.totalBalance = await this.ethRepository.getUserBalanceSumm(
        props.user
      )
    }

    if (props.addresses) {
      result.addresses = await this.ethRepository.getUserAdresses(props.user)
    }

    if (props.transactions) {
      // TODO
      // Оптимизировать запрос

      const userWallets = await props.user.ethWallets

      const walletsIds = userWallets.map(wallet => wallet.id)

      result.transactions = await this.ethTsxRepository.getTransactionsByWalletIds(
        walletsIds
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

  async getWalletBalanceStats(days, wallet: WalletETH) {
    let totalBalance = +wallet.balance
    let summs = await this.ethTsxRepository.getSumOfWalletsTsxByDays(days, [wallet])

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
        totalBalance += sumForDay
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
    let totalBalance = await this.ethRepository.getUserBalanceSumm(user)
    const wallets = await user.ethWallets
    if (!wallets.length) {
      return []
    }
    const summs = await this.ethTsxRepository.getSumOfWalletsTsxByDays(days, wallets)
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
        totalBalance += sumForDay
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
