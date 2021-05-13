import { Injectable } from '@nestjs/common'
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'
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
import { ERC20TransactionRepository } from 'src/tokens/repositories/ERC20-transaction.repository'

@Injectable()
export class EthService {
  constructor(
    private walletProviderService: EthWalletProviderService,
    private erc20tokenservice: ERC20TokenService,
    @InjectRepository(EthTransactionRepository)
    private ethTsxRepository: EthTransactionRepository,
    @InjectRepository(EthRepository)
    private ethRepository: EthRepository,
    @InjectPinoLogger(EthService.name) private readonly logger: PinoLogger,
    @InjectRepository(ERC20TransactionRepository)
    private erc20tsxRepository: ERC20TransactionRepository
  ) {}

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

  async getWallet(props: IGetWalletProps) {
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
        walletsIds,
        { hashtags: true }
      )
    }

    return result
  }

  /*
    Получение отчета по истории суммы балансов всех кошельков пользователя за последние n дней
    Возвращает массив по типу
    {
      date: '2021-03-20'
      value: 666
    }
  */

  async getUserBalanceStats(
    days: number,
    user: User
  ): Promise<{ date: string; value: number }[]> {
    let totalBalance = await this.ethRepository.getUserBalanceSumm(user)
    this.logger.debug(
      `Total balance in eth:getUserBalanceStats ${totalBalance}`
    )
    const wallets = await user.ethWallets

    if (!wallets.length) {
      return []
    }
    const walletIds = wallets.map(wallet => {
      return wallet.id
    })
    let tsxSums = await this.ethTsxRepository.getSumOfWalletsTsxByDays(
      days,
      walletIds
    )
    const tsxFees = await this.ethTsxRepository.getSumOfWalletsFees(
      days,
      walletIds
    )
    const tokenFees = await this.erc20tsxRepository.getSumOfWalletsFees(
      days,
      walletIds
    )

    let balanceHistory = this.calculateBalanceHistory(
      totalBalance,
      days,
      tsxSums,
      tsxFees,
      tokenFees
    )

    return balanceHistory
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
    wallet: WalletETH
  ): Promise<{ date: string; value: number }[]> {
    let totalBalance = +wallet.balance
    let tsxSum = await this.ethTsxRepository.getSumOfWalletsTsxByDays(days, [
      wallet.id
    ])
    const tsxFees = await this.ethTsxRepository.getSumOfWalletsFees(days, [
      wallet.id
    ])
    const tokenFees = await this.erc20tsxRepository.getSumOfWalletsFees(days, [
      wallet.id
    ])

    const balanceHistory = this.calculateBalanceHistory(
      totalBalance,
      days,
      tsxSum,
      tsxFees,
      tokenFees
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
    tsxFees: { date: string; value: number }[],
    tokenFees: { date: string; value: number }[]
  ): { date: string; value: number }[] {
    const txnSumMap: Map<string, number> = new Map()
    const tsxFeesMap: Map<string, number> = new Map()
    const tokenFeesMap: Map<string, number> = new Map()

    tsxSums.forEach(sum => {
      txnSumMap.set(sum.date, sum.value)
    })

    tsxFees.forEach(sum => {
      tsxFeesMap.set(sum.date, +sum.value)
    })

    tokenFees.forEach(sum => {
      tokenFeesMap.set(sum.date, +sum.value)
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

        const tsxFee = tsxFeesMap.get(yesterdayDate)
        this.logger.debug(`Fee summ is ${balance}`)
        if (tsxFee) {
          balance = balance - tsxFee
        }

        const tokenFee = tokenFeesMap.get(yesterdayDate)
        this.logger.debug(`Fee summ is ${balance}`)
        if (tokenFee) {
          balance = balance - tokenFee
        }
      }

      if (balance < 0.0009) {
        balance = 0
      }

      const record: { date: string; value: number } = {
        date: todayDate,
        value: balance
      }

      balanceHistory.push(record)
    }

    this.logger.debug(`balanceHistory eth report is`)
    console.log(balanceHistory)

    return balanceHistory
  }
}
