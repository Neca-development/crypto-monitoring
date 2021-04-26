import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'
import { EthRepository } from 'src/wallet/repositories/eth.repository'
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent
} from 'typeorm'

@EventSubscriber()
@Injectable()
export class EthWalletsPool implements EntitySubscriberInterface<WalletETH> {
  constructor(
    @InjectRepository(WalletETH) private ethRepository: EthRepository
  ) {}

  private logger = new Logger(EthWalletsPool.name)

  private walletsMap: Map<string, WalletETH> = new Map()

  getWallet(address: string): WalletETH {
    return this.walletsMap.get(address)
  }

  async onModuleInit() {
    let wallets = await this.ethRepository.getAllWallets()
    wallets.forEach(wallet => {
      this.walletsMap.set(wallet.address, wallet)
    })
  }

  afterInsert(event: InsertEvent<WalletETH>) {
    this.walletsMap.set(event.entity.address, event.entity)
    this.logger.debug(`Wallet added`)
    console.log(event)
    console.log(this.walletsMap)
  }

  afterRemove(event: RemoveEvent<WalletETH>) {
    this.walletsMap.delete(event.databaseEntity.address)
    this.logger.debug(`Wallet deleted`)
    console.log(event)
    console.log(this.walletsMap)
  }
}
