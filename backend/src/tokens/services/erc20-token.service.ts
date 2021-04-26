import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'
import { ERC20TokenProviderService } from './erc20-token-provider.service'
import { ERC20TokenRepository } from '../repositories/ERC20-token.repository'
import { ERC20TransactionRepository } from '../repositories/ERC20-transaction.repository'

// TODO
// Заменить почту и пассворд от email нотификаций

@Injectable()
export class ERC20TokenService {
  constructor(
    private erc20TokenProviderService: ERC20TokenProviderService,
    @InjectRepository(ERC20TokenRepository)
    private tokenRepository: ERC20TokenRepository,
    @InjectRepository(ERC20TransactionRepository)
    private transactionRepository: ERC20TransactionRepository
  ) {}

  async checkAndAddWalletTokens(wallet: WalletETH) {
    let tokens = await this.erc20TokenProviderService.getTokensByAddress(
      wallet.address
    )

    for await (let tokenModel of tokens) {
      let token = await this.tokenRepository.createToken({
        balance: tokenModel.balance,
        type: tokenModel.type
      })

      if (tokenModel.transactions.length) {
        await this.transactionRepository.addTransactionsByModel(
          tokenModel.transactions,
          token
        )
      }

      token.wallet = wallet
      await token.save()
    }

    return await wallet.save()
  }
}
