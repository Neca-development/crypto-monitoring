import { Injectable } from '@nestjs/common'
import { User } from 'src/auth/user/user.entity'
import { WalletProviderService } from './wallet-provider.service'

@Injectable()
export class BtcService {
  constructor() {}

  async addWallet(user: User, address: string) {
    // let wallet = await this.WalletProviderService.getBtcWallet(address)
    // console.log(`Add wallet injected`)
    // console.log(`Wallet created`, wallet)
    // return wallet
  }
}
