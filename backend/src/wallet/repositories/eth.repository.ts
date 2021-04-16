import {
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { User } from 'src/auth/user/user.entity'
import { NumToEth } from 'src/helpers/NumToEth'
import { EntityRepository, Repository } from 'typeorm'
import { WalletETH } from '../entities/Wallet-eth.entity'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'

@EntityRepository(WalletETH)
export class EthRepository extends Repository<WalletETH> {
  private readonly logger = new Logger(EthRepository.name)

  addWaletByModel(props: { address: string; balance: number }) {
    let wallet = this.create()
    wallet.address = props.address
    wallet.balance = NumToEth(props.balance)
    return wallet
  }

  async deleteWalletById(walletID: number) {
    let wallet = await this.findOne({ id: walletID })
    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} not found`)
    }
    return await wallet.remove()
  }

  async getBalanceSumm() {
    let query = this.createQueryBuilder('wallet')
    query.select('SUM(wallet.balance)', 'sum')
    let result = await query.getRawOne()
    if (result.sum == null) {
      return 0
    }
    return result.sum
  }

  async getAllWallets() {
    return await this.find()
  }

  async getWalletById(id: number) {
    return await this.findOne({ id })
  }

  async getWallet(props: IGetWalletProps) {
    const { walletID, user, transactions } = props

    let wallet = await this.getWalletById(walletID)

    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} found`)
    }

    let result: any = {
      id: wallet.id,
      balance: wallet.balance,
      address: wallet.address
    }

    if (user) {
      result.user = wallet.user
    }

    if (transactions) {
      result.transactions = await wallet.transactions
    }

    return result
  }

  async getUserAdresses(user: User): Promise<String[]> {
    let query = this.createQueryBuilder('wallet')
      .select('wallet.address')
      .where('wallet.userId = :userID', { userID: user.id })

    let result = await query.getMany()
    let resultArr = result.map(element => element.address)

    return resultArr
  }

  async getUserBalanceSumm(user: User): Promise<Number> {
    let query = this.createQueryBuilder('wallet')
    query
      .select('SUM(wallet.balance)', 'sum')
      .where('wallet.userId = :userID', { userID: user.id })
    let result = await query.getRawOne()
    if (result.sum == null) {
      return 0
    }
    return result.sum
  }
}
