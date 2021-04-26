import { Injectable } from '@nestjs/common'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'
import { ERC20TokenProviderService } from './erc20-token-provider.service'

@Injectable()
export class ERC20TokenService {
  constructor(private erc20TokenProviderService: ERC20TokenProviderService) {}
  async checkAndAddWalletTokens(wallet: WalletETH) {
    let tokens = await this.erc20TokenProviderService.getTokensByAddress(
      wallet.address
    )

    tokens.forEach(token => {
      token.wallet = wallet
    })

    return await wallet.save()
  }
}
