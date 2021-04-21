import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'
import { BtcRepository } from '../repositories/btc.repository'
import { BtcTransactionRepository } from '../repositories/btc.transaction.repository'
import { BtcWalletProviderService } from './btc.wallet-provider.service'
import { IGetUserWalletsInfo } from '../interfaces/IGetInfoByUser.props'
import { WalletBTC } from '../entities/Wallet-btc.entity'
import { WalletBtcModel } from '../interfaces/Wallet-btc.model'

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

  async getWallet(props: IGetWalletProps): Promise<WalletBTC> {
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

      result.transactions = await this.btcTransactionRepository.getTransactionsByIds(
        walletsIds
      )
    }

    return result
  }
}
