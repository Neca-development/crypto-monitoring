import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from 'src/auth/user/user.repository'
import { BtcRepository } from './repositories/btc.repository'
import { BtcTransactionRepository } from './repositories/btc.transaction.repository'
import { EthRepository } from './repositories/eth.repository'
import { EthTransactionRepository } from './repositories/eth.transaction.repository'
import { BtcService } from './services/btc.service'
import { BtcWalletProviderService } from './services/btc.wallet-provider.service'
import { EthService } from './services/eth.service'
import { EthWalletProviderService } from './services/eth.wallet-provider.service'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    EthWalletProviderService,
    BtcWalletProviderService,
    BtcService,
    EthService
  ],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      UserRepository,
      EthRepository,
      EthTransactionRepository,
      BtcRepository,
      BtcTransactionRepository
    ])
  ]
})
export class WalletModule {}
