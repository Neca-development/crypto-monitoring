import { InternalServerErrorException, Logger } from '@nestjs/common'
import { NumToEth } from 'src/helpers/NumToEth'
import { EntityRepository, Repository } from 'typeorm'
import { WalletETH } from '../entities/Wallet-eth.entity'

@EntityRepository(WalletETH)
export class EthRepository extends Repository<WalletETH> {
  private readonly logger = new Logger(EthRepository.name)

  addWaletByModel(props: { address: string; balance: number }) {
    try {
      let wallet = this.create()
      wallet.address = props.address
      wallet.balance = NumToEth(props.balance)
      return wallet
    } catch (e) {
      throw new InternalServerErrorException('Cannot create wallet')
    }
  }

  getAllWallets() {
    return this.find()
  }
}
