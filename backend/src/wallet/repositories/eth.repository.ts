import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import moment from 'moment'
import { User } from 'src/auth/user/user.entity'
import { dbErrorCodes } from 'src/config/db-error-codes'
import { NumToEth } from 'src/helpers/NumToEth'
import { EntityRepository, Repository } from 'typeorm'
import { WalletETH } from '../entities/Wallet-eth.entity'
import { IGetWalletProps } from '../interfaces/IGetWalletProps'

@EntityRepository(WalletETH)
export class EthRepository extends Repository<WalletETH> {
  private readonly logger = new Logger(EthRepository.name)

  /*
    Добавление кошелька по модели
    Создаёт кошель в бд
    Затем его возвращает

    В случае если кошель с переданным адресом уже существует выбросит Conflict
  */

  async getWalletByAddress(address: string) {
    return await this.findOneOrFail({ address })
  }

  async addWaletByModel(props: {
    address: string
    balance: number
  }): Promise<WalletETH> {
    const wallet = this.create()
    wallet.address = props.address
    wallet.balance = NumToEth(props.balance)

    try {
      return await wallet.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        this.logger.error(
          `Cannot create wallet with address: ${props.address}, it already exists`
        )
        throw new ConflictException(
          `Wallet with address ${props.address} already exists`
        )
      }
      this.logger.error(`Cannot create wallet`, e.stack)
      this.logger.error({ wallet, props })
      throw new InternalServerErrorException('Cannot create wallet')
    }
  }

  /*
    Удаление кошелька по id
    выбрасывает нотфоунд если кошелек не был найден
    Либо же удалённый кошель в случае успеха
  */

  async deleteWalletById(walletID: number): Promise<WalletETH> {
    const wallet = await this.findOne({ id: walletID })
    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} not found`)
    }
    return await wallet.remove()
  }

  /*
    Получение суммы балансов всех eth кошельков
  */

  async getBalanceSumm(): Promise<number> {
    const query = this.createQueryBuilder('wallet')
    query.select('SUM(wallet.balance)', 'sum')
    const result = await query.getRawOne()
    if (result.sum == null) {
      return 0
    }
    return result.sum
  }

  async getAllWallets(): Promise<WalletETH[]> {
    return await this.find()
  }

  /*
    Получение кошеля по id
    Ничего не выбрасывает в сулчае ненахода
  */

  async getWalletById(id: number): Promise<WalletETH> {
    return await this.findOne({ id })
  }

  /*
    Получение кошелька по его id
    В интерфейсе указывается какую именно информацию необходимо получить
    Если кошель не будет найден выбросит NotFound
  */

  async getWallet(props: IGetWalletProps) {
    const { walletID, user, transactions } = props

    const wallet = await this.getWalletById(walletID)

    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} found`)
    }

    const result: any = {
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
    const query = this.createQueryBuilder('wallet')
      .select('wallet.address')
      .addSelect('wallet.id')
      .where('wallet.userId = :userID', { userID: user.id })
    const result = await query.getMany()

    return result
  }

  /*
    Получение суммы балансов всех eth кошельков пользователя
  */

  async getUserBalanceSumm(user: User): Promise<number> {
    const query = this.createQueryBuilder('wallet')
    query
      .select('SUM(wallet.balance)', 'sum')
      .where('wallet.userId = :userID', { userID: user.id })
    const result = await query.getRawOne()
    if (result.sum == null) {
      return 0
    }
    return +result.sum
  }
  
}
