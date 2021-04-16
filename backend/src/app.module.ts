import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { AuthModule } from './auth/auth.module'
import { WalletModule } from './wallet/wallet.module'
import { BtcService } from './wallet/services/btc.service'
import { EthWalletProviderService } from './wallet/services/eth.wallet-provider.service'
import { EmailService } from './email/email.service'
import { EmailModule } from './email/email.module'
import { MonitoringService } from './monitoring/monitoring.service'
import { EthRepository } from './wallet/repositories/eth.repository'
import { EthTransactionRepository } from './wallet/repositories/eth.transaction.repository'
import { BtcWalletProviderService } from './wallet/services/btc.wallet-provider.service'
import { BtcRepository } from './wallet/repositories/btc.repository'
import { BtcTransactionRepository } from './wallet/repositories/btc.transaction.repository'
import { BtcMonitoringService } from './btc-monitoring/btc-monitoring.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      EthRepository,
      EthTransactionRepository,
      BtcTransactionRepository,
      BtcRepository
    ]),
    AuthModule,
    WalletModule,
    EmailModule
  ],
  controllers: [],
  providers: [
    WalletModule,
    BtcService,
    EthWalletProviderService,
    EmailService,
    MonitoringService,
    BtcWalletProviderService,
    BtcMonitoringService
  ]
})
export class AppModule {}
