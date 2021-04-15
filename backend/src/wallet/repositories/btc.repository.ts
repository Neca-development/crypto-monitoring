import { Logger } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { WalletBTC } from '../entities/Wallet-btc.entity'

@EntityRepository(WalletBTC)
export class BtcRepository extends Repository<WalletBTC> {
  private readonly logger = new Logger(BtcRepository.name)

  addWallet() {}
}
