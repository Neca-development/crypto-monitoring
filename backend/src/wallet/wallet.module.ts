import { HttpModule, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserRepository } from 'src/auth/user/user.repository'
import { ERC20TokenProviderService } from 'src/tokens/services/erc20-token-provider.service'
import { ERC20TokenService } from 'src/tokens/services/erc20-token.service'
import { ERC20TokenTypeRepository } from 'src/tokens/repositories/ERC20-token-type.repository'
import { ERC20TokenRepository } from 'src/tokens/repositories/ERC20-token.repository'
import { ERC20TransactionRepository } from 'src/tokens/repositories/ERC20-transaction.repository'
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
import { ERC20ContractsService } from 'src/tokens/services/erc20-contracts.service'

@Module({
  controllers: [WalletController],
  providers: [
    WalletService,
    EthWalletProviderService,
    BtcWalletProviderService,
    BtcService,
    EthService,
    ERC20TokenService,
    ERC20TokenProviderService,
    ERC20ContractsService
  ],
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      UserRepository,
      EthRepository,
      EthTransactionRepository,
      BtcRepository,
      BtcTransactionRepository,
      ERC20TokenRepository,
      ERC20TransactionRepository,
      ERC20TokenTypeRepository
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt'
    })
  ]
})
export class WalletModule {}
