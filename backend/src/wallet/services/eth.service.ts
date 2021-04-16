import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { dbErrorCodes } from 'src/config/db-error-codes'
import { IGetUserWalletsInfo } from '../interfaces/IGetInfoByUser.props'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'
import { EthRepository } from '../repositories/eth.repository'
import { EthTransactionRepository } from '../repositories/eth.transaction.repository'
import { EthWalletProviderService } from './eth.wallet-provider.service'

@Injectable()
export class EthService {
  private logger = new Logger(EthService.name)

  constructor(
    private WalletProviderService: EthWalletProviderService,
    @InjectRepository(EthTransactionRepository)
    private ethTsxRepository: EthTransactionRepository,
    @InjectRepository(EthRepository)
    private ethRepository: EthRepository
  ) {}

  async createWallet(address: string) {
    let walletModel = await this.WalletProviderService.getEthWallet(address)
    let wallet = await this.ethRepository.addWaletByModel({
      address: walletModel.address,
      balance: walletModel.balance
    })

    let tsx: any

    try {
      tsx = await this.ethTsxRepository.addTransactions(
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
    return await this.ethRepository.getBalanceSumm()
  }

  async deleteWallet(walletID: number) {
    return await this.ethRepository.deleteWalletById(walletID)
  }

  async getWallet(props: IGetWalletProps) {
    return await this.ethRepository.getWallet(props)
  }

  async getInfoByUser(props: IGetUserWalletsInfo) {
    // return await this.btcRepository.getInfoByUser(props)
    let result: any = {}

    // TODO
    // Переписать на promise all

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

      let userWallets = await props.user.ethWallets

      let walletsIds = userWallets.map(wallet => wallet.id)

      result.transactions = await this.ethTsxRepository.getTransactionsByWalletIds(
        walletsIds
      )
    }

    return result
  }
}
