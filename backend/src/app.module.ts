import { HttpModule, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { typeOrmConfig } from './config/typeorm.config'
import { AuthModule } from './auth/auth.module'
import { WalletModule } from './wallet/wallet.module'
import { BtcService } from './wallet/services/btc.service'
import { EthWalletProviderService } from './wallet/services/eth.wallet-provider.service'
import { EmailService } from './email/email.service'
import { EmailModule } from './email/email.module'
import { EthMonitoringService } from './monitoring/eth-monitoring.service'
import { EthRepository } from './wallet/repositories/eth.repository'
import { EthTransactionRepository } from './wallet/repositories/eth.transaction.repository'
import { BtcWalletProviderService } from './wallet/services/btc.wallet-provider.service'
import { BtcRepository } from './wallet/repositories/btc.repository'
import { BtcTransactionRepository } from './wallet/repositories/btc.transaction.repository'
import { BtcMonitoringService } from './monitoring/btc-monitoring.service'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { ERC20TokenProviderService } from './tokens/erc20-token-provider.service'
import { ERC20TokenRepository } from './tokens/repositories/ERC20-token.repository'
import { ERC20TokenTypeRepository } from './tokens/repositories/ERC20-token-type.repository'
import { ERC20TransactionRepository } from './tokens/repositories/ERC20-transaction.repository'
import { ERC20TokenService } from './tokens/erc20-token.service'

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend')
    }),
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
    // EthMonitoringService,
    // BtcMonitoringService,
    BtcWalletProviderService
  ]
})
export class AppModule {}
