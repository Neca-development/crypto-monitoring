import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { dbErrorCodes } from 'src/config/db-error-codes'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'
import { BtcRepository } from '../repositories/btc.repository'
import { BtcTransactionRepository } from '../repositories/btc.transaction.repository'
import { BtcWalletProviderService } from './btc.wallet-provider.service'
import { IGetUserWalletsInfo } from '../interfaces/IGetInfoByUser.props'

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
  */

  async createWallet(address: string) {
    let walletModel = await this.btcWalletProviderService.getBtcWallet(address)
    let wallet = await this.btcRepository.addWaletByModel({
      address: walletModel.address,
      balance: walletModel.balance
    })

    let tsx: any

    try {
      tsx = await this.btcTransactionRepository.addTransactions(
        wallet,
        walletModel.transactions
      )
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        throw new ConflictException(
          `Walet with address ${address} already exists`
        )
      }
      this.logger.log(`Cannot add transactions`, e.stack)
      throw new InternalServerErrorException('Cannot add wallet transactions')
    }

    return tsx
  }

  async getWalletsSummBalance(): Promise<Number> {
    return await this.btcRepository.getBalanceSumm()
  }

  async deleteWallet(walletID: number) {
    return await this.btcRepository.deleteWalletById(walletID)
  }

  async getWallet(props: IGetWalletProps) {
    return await this.btcRepository.getWallet(props)
  }

  async getInfoByUser(props: IGetUserWalletsInfo) {
    // return await this.btcRepository.getInfoByUser(props)
    let result: any = {}

    // TODO
    // Переписать на promise all

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
