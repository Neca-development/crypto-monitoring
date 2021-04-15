import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from 'src/auth/user/user.repository'
import { EthRepository } from './repositories/eth.repository'
import { EthTransactionRepository } from './repositories/eth.transaction.repository'
import { BtcService } from './services/btc.service'
import { EthService } from './services/eth.service'
import { WalletProviderService } from './services/wallet-provider.service'
import { WalletController } from './wallet.controller'
import { WalletService } from './wallet.service'

@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletProviderService, BtcService, EthService],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([UserRepository]),
    TypeOrmModule.forFeature([EthRepository]),
    TypeOrmModule.forFeature([EthTransactionRepository])
  ]
})
export class WalletModule {}
