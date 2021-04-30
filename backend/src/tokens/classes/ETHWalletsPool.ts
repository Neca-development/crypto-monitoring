import { Injectable, Logger } from '@nestjs/common'
import { InjectConnection, InjectRepository } from '@nestjs/typeorm'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'
import { EthRepository } from 'src/wallet/repositories/eth.repository'
import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent
} from 'typeorm'

/*
  Здесь кешируются адресса eth кошельков в виде map
  Работает с помощью eventListener-ов typeorm
*/
@Injectable()
export class EthWalletsPool implements EntitySubscriberInterface {
  constructor(
    @InjectRepository(EthRepository) private ethRepository: EthRepository,
    @InjectConnection() readonly connection: Connection
  ) {
    connection.subscribers.push(this)
  }

  private logger = new Logger(EthWalletsPool.name)

  readonly walletAdresses: Set<string> = new Set()

  walletExists(address: string): boolean {
    return this.walletAdresses.has(address)
  }

  async onModuleInit() {
    let wallets = await this.ethRepository.getAllWallets()
    wallets.forEach(wallet => {
      this.walletAdresses.add(wallet.address)
    })
  }

  private addWallet(address: string) {
    this.walletAdresses.add(address)
    this.logger.debug('Wallet added')
    this.logger.debug('Map now')
    console.log(this.walletAdresses)
  }

  private deleteWallet(address: string) {
    this.walletAdresses.delete(address)

    this.logger.debug('Wallet deleted')
    this.logger.debug('Map now')
    console.log(this.walletAdresses)
  }

  listenTo() {
    return WalletETH
  }

  afterInsert(event: InsertEvent<WalletETH>) {
    if (event.entity.address) {
      this.addWallet(event.entity.address)
    }
  }

  afterRemove(event: RemoveEvent<WalletETH>) {
    if (event.entity.address) {
      this.deleteWallet(event.entity.address)
    }
  }
}
