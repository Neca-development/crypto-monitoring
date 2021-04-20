import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { User } from 'src/auth/user/user.entity'
import { dbErrorCodes } from 'src/config/db-error-codes'
import { EntityRepository, Repository } from 'typeorm'
import { WalletBTC } from '../entities/Wallet-btc.entity'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'

@EntityRepository(WalletBTC)
export class BtcRepository extends Repository<WalletBTC> {
  private readonly logger = new Logger(BtcRepository.name)

  async addWaletByModel(props: { address: string; balance: number }) {
    let wallet = this.create()
    wallet.address = props.address
    wallet.balance = props.balance

    try {
      return await wallet.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        throw new ConflictException(
          `Wallet with address ${props.address} already exists`
        )
      }
      throw new InternalServerErrorException('Cannot create wallet')
    }
  }

  async deleteWalletById(walletID: number) {
    let wallet = await this.findOne({ id: walletID })
    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} not found`)
    }
    return await wallet.remove()
  }

  /*
    Получение суммы балансов всех кошельков
  */
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

  async getUserAdresses(user: User) {
    let query = this.createQueryBuilder('wallet')
      .select('wallet.address')
      .addSelect('wallet.id')
      .where('wallet.userId = :userID', { userID: user.id })
    let result = await query.getMany()

    return result
  }

  async getUserBalanceSumm(user: User) {
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

  // async getInfoByUser(props: IGetUserWalletsInfo) {
  //   const { user, wallets, transactions } = props

  //   const userWallets = await user.btcWallets

  //   let result: any = {}

  //   if (wallets) {
  //     result.wallets = userWallets
  //   }

  //   let allTransactions: TransactionBTC[] = []
  // }

  async getWalletById(id: number) {
    return await this.findOne({ id })
  }
}
