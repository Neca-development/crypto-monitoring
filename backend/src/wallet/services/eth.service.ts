import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/auth/user/user.entity'
import { EthRepository } from '../repositories/eth.repository'
import { EthTransactionRepository } from '../repositories/eth.transaction.repository'
import { WalletProviderService } from './wallet-provider.service'

@Injectable()
export class EthService {
  private logger = new Logger(EthService.name)

  constructor(
    private WalletProviderService: WalletProviderService,
    @InjectRepository(EthTransactionRepository)
    private ethTsxRepository: EthTransactionRepository,
    @InjectRepository(EthRepository)
    private ethRepository: EthRepository
  ) {}

  async addWallet(user: User, address: string) {
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
      this.logger.log(`Cannot add transactions`, e.stack)
      throw new InternalServerErrorException('Cannot add transactions')
    }

    return tsx
  }
}
