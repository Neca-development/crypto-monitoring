import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
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
  Изначально возвращается с id, балансом, адресом, средней ценой закупки

  Хештеги в транзакциях возвращаются в виде
  __hashtags__

  Но обратится к ним можно через transaction.hashtags

  На данный момент костыль без решения

  https://stackoverflow.com/questions/65608223/the-find-function-in-typeorm-return-field-with-underscores
*/

  // async onModuleInit() {
  //   const result = await this.getWalletById(1)
  //   console.log(result)
  // }

  async getWallet(props: IGetWalletProps) {
    const { walletID, user, transactions, tsxHashtags } = props

    let query = this.createQueryBuilder('wallet')

    const selections = ['wallet']

    query.where('wallet.id = :walletID', { walletID })

    if (user) {
      query.innerJoinAndSelect('wallet.user', 'user')
      selections.push('user')
    }

    if (transactions) {
      query.innerJoinAndSelect('wallet.transactions', 'transactions')
      query.orderBy('transactions.time', 'ASC')
      selections.push('transactions')

      if (tsxHashtags) {
        query.leftJoinAndSelect(
          'transactions.hashtags',
          'hashtags',
          'transactions.id = hashtags.transactionId'
        )
        selections.push('hashtags')
      }
    }

    query.select(selections)

    let walletDB: any = await query.getOne()

    if (!walletDB) {
      throw new NotFoundException(`Wallet with id ${walletID} not found`)
    }

    const wallet: any = {
      id: walletDB.id,
      balance: walletDB.balance,
      mediumBuyPrice: walletDB.mediumBuyPrice,
      address: walletDB.address
    }

    if (user) {
      wallet.user = walletDB.user
    }

    if (transactions) {
      wallet.transactions = walletDB.__transactions__
    }

    return wallet
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

  /*
    Установление средней цены закупки кошелька
    В случае если кошель не будет найден выбросит NotFound
    Если передать цену ниже нуля - BadRequest
  */

  async setMediumBuyPriceById(walletID: number, price: number) {
    if (price < 0) {
      throw new BadRequestException('Price must be more than 0!')
    }

    let wallet = await this.getWalletById(walletID)

    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} not found!`)
    }

    wallet.mediumBuyPrice = price

    await wallet.save()

    return wallet
  }

  /*
    Удаление средней цены закупки кошелька в null
    В случае если кошель не будет найден выбросит NotFound
  */

  async deleteMediumBuyPriceById(walletID: number) {
    let wallet = await this.getWalletById(walletID)

    if (!wallet) {
      throw new NotFoundException(`Wallet with id ${walletID} not found!`)
    }

    wallet.mediumBuyPrice = null

    await wallet.save()

    return wallet
  }
}
