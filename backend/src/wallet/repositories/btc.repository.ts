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

  /*
    Добавление кошелька по модели
    Создаёт кошель в бд
    Затем его возвращает
    
    В случае если кошель с переданным адресом уже существует выбросит Conflict
  */

  async addWaletByModel(props: {
    address: string
    balance: number
  }): Promise<WalletBTC> {
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

  /*
    Удаление кошелька по id
    выбрасывает нотфоунд если кошелек не был найден
    Возвращает удалённый кошель
  */

  async deleteWalletById(walletID: number): Promise<WalletBTC> {
    let wallet = await this.findOne({ id: walletID })
    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} not found`)
    }
    return await wallet.remove()
  }

  /*
    Получение суммы балансов всех btc кошельков
  */
  async getBalanceSumm(): Promise<number> {
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

  /*
    Получение кошелька по его id
    В интерфейсе указывается какую именно информацию необходимо получить
    Если кошель не будет найден выбросит NotFound
  */

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

  /*
    Получение списка адресов кошельков клиента
  */

  async getUserAdresses(
    user: User
  ): Promise<{ address: string; id: number }[]> {
    let query = this.createQueryBuilder('wallet')
      .select('wallet.address')
      .addSelect('wallet.id')
      .where('wallet.userId = :userID', { userID: user.id })
    let result = await query.getMany()

    return result
  }

  /*
    Получение суммы балансов всех btc кошельков пользователя
  */

  async getUserBalanceSumm(user: User): Promise<number> {
    let query = this.createQueryBuilder('wallet')
    query
      .select('SUM(wallet.balance)', 'sum')
      .where('wallet.userId = :userID', { userID: user.id })
    let result = await query.getRawOne()
    if (result.sum == null) {
      return 0
    }
    return +result.sum
  }

  /*
    Получение кошеля по id
    Ничего не выбрасывает в случае ненахоода
  */

  async getWalletById(id: number): Promise<WalletBTC> {
    return await this.findOne({ id })
  }
}
