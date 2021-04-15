import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { AuthModule } from './auth/auth.module'
import { WalletModule } from './wallet/wallet.module'
import { BtcService } from './wallet/services/btc.service'
import { WalletProviderService } from './wallet/services/wallet-provider.service'
import { EmailService } from './email/email.service'
import { EmailModule } from './email/email.module'
import { MonitoringService } from './monitoring/monitoring.service'
import { EthRepository } from './wallet/repositories/eth.repository'
import { EthTransactionRepository } from './wallet/repositories/eth.transaction.repository'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([EthRepository, EthTransactionRepository]),
    AuthModule,
    WalletModule,
    EmailModule
  ],
  controllers: [],
  providers: [
    WalletModule,
    BtcService,
    WalletProviderService,
    EmailService,
    MonitoringService
  ]
})
export class AppModule {}
