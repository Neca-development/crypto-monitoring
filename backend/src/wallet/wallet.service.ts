import {
  BadRequestException,
  HttpService,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/auth/user/user.entity'
import { UserRepository } from 'src/auth/user/user.repository'
import { GetWalletDto } from '../dto/admin.get-wallet.dto'
import { AddWalletDto } from '../dto/admin.add-wallet.dto'
import { DeleteWalletDto } from '../dto/admin.delete-wallet.dto'
import { GetWalletsStats } from '../dto/admin.get-wallets-stats.dto'
import { WalletType } from './enum/WalletType.enum'
import { BtcService } from './services/btc.service'
import { EthService } from './services/eth.service'
import { IGetWalletProps } from './interfaces/IGetWalletProps'
import { GetUserWalletsInfo } from '../dto/admin.wallets-user-info.dto'
import { UserRole } from 'src/auth/enum/user-role.enum'

/*
  Сервис отвечающий за кошельки
  Служит менеджером/прослойкой между интерфейсом и сервисами конкретных кошельков
  В основном занимается логикой распределения запросов к btc/eth кошелькам
  И старается огородить логику конкретных кошельков от преставлений ожидаемых в интерфейсе

  Существуют сервисы конкретных кошельков, занимающиеся логикой btc/eth
  WalletService же обращается к ним в зависимости от type: enum btc/eth
  Который был передан в запросе
*/

@Injectable()
export class WalletService {
  constructor(
    private BtcService: BtcService,
    private EthService: EthService,
    private httpService: HttpService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  /*
    Добавление нового кошелька
    
    Метод пытается найти пользователя из dto
    И в зависимости от типа кошелька в dto
    Направляет дальнейшую логику создания кошелька соответсвующим сервисам
    После создания присваивает кошельку пользователя
  */

  async addWallet(addWalletDto: AddWalletDto): Promise<void> {
    const { userID, address, type } = addWalletDto
    const user: User = await this.userRepository.getUserById(userID)

    if (!user) {
      throw new NotFoundException(`User with id ${userID} not found`)
    }

    let wallet

    switch (type) {
      case WalletType.btc:
        wallet = await this.BtcService.createWallet(address)
        break
      case WalletType.eth:
        wallet = await this.EthService.createWallet(address)
        break

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }

    wallet.user = user
    await wallet.save()
  }

  /*
    Удаление кошелька
    Исходя из типа делегирует удаление конкретным сервисам
  */

  async deleteWallet(deleteWalletDto: DeleteWalletDto) {
    const { walletID, type } = deleteWalletDto

    let wallet

    switch (type) {
      case WalletType.btc:
        wallet = await this.BtcService.deleteWallet(walletID)
        break
      case WalletType.eth:
        wallet = await this.EthService.deleteWallet(walletID)
        break

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }

    return wallet
  }

  /*
    Получение статистики по всем кошелькам
    В dto указывается что именно необходимо получить
  */

  async getWalletsStats(getWalletsStatsDto: GetWalletsStats) {
    let response: any = {}

    if (
      getWalletsStatsDto.ethBalanceSumm ||
      getWalletsStatsDto.ethBalanceSummEur
    ) {
      response.ethBalanceSumm = await this.EthService.getWalletsSummBalance()
    }

    if (
      getWalletsStatsDto.btcBalanceSumm ||
      getWalletsStatsDto.btcBalanceSummEur
    ) {
      response.btcBalanceSumm = await this.BtcService.getWalletsSummBalance()
    }

    if (getWalletsStatsDto.ethBalanceSummEur) {
      response.ethBalanceSummEur = await this.ethToEur(response.ethBalanceSumm)
    }

    if (getWalletsStatsDto.btcBalanceSummEur) {
      response.btcBalanceSummEur = await this.btcToEur(response.btcBalanceSumm)
    }

    return response
  }

  // TODO
  // Вынести в отдельный сервис

  /*
    Конвертация эфира в евро
    Происходит с помощью стороннего api
  */

  async ethToEur(value: number): Promise<number> {
    let result = await this.httpService
      .get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=EUR'
      )
      .toPromise()

    let currency = result.data.ethereum.eur
    return value * currency
  }

  /*
    Конвертация битка в евро
    Происходит с помощью стороннего api
  */

  async btcToEur(value: number): Promise<number> {
    let result = await this.httpService
      .get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=EUR'
      )
      .toPromise()

    let currency = result.data.bitcoin.eur
    return value * currency
  }

  /*
    Получение кошелька по id
    В dto указываются какую информацию необходимо получить
  */

  async getWallet(getWalletDto: GetWalletDto) {
    const {
      walletID,
      type,
      transactions,
      holderName,
      balanceInEur
    } = getWalletDto

    let wallet: any = {
      id: walletID,
      type
    }

    const props: IGetWalletProps = {
      walletID,
      transactions,
      user: holderName
    }

    let result: any = {}

    /*
      Перенпаравление запроса к соответсвующему сервису
      В зависимости от типа кошелька
    */

    switch (type) {
      case WalletType.btc: {
        result = await this.BtcService.getWallet(props)
        break
      }
      case WalletType.eth:
        result = await this.EthService.getWallet(props)
        break

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }

    wallet.address = result.address
    wallet.balance = result.balance

    /*
      Конвертация балансов в евро
    */

    if (balanceInEur) {
      switch (type) {
        case WalletType.btc: {
          wallet.balanceEur = await this.btcToEur(wallet.balance)
          break
        }
        case WalletType.eth:
          wallet.balanceEur = await this.ethToEur(wallet.balance)
          break

        default:
          throw new BadRequestException(`Invalid wallet type ${type}`)
      }
    }

    if (holderName) {
      wallet.holderName = result.user.fullName
    }

    if (transactions) {
      wallet.transactions = result.transactions
    }

    return wallet
  }

  /*
    Получение информации по кошелькам конкретного пользователя
    dto указывает какую именно информацию необходимо получить
    
    В основном делегирует логику сервисам кошельков

    Пользователя ищет по userID
    Если не находит - выбрасывает нот фоунд эксепшен
  */

  async userWalletsInfo(userWalletsInfo: GetUserWalletsInfo) {
    const {
      userID,
      fullName,
      addresses,
      balancesSumm,
      balancesSummEur,
      transactions
    } = userWalletsInfo

    const user: User = await this.userRepository.getUserById(userID)
    let result: any = {}

    if (!user) {
      throw new NotFoundException(`User with id ${userID} not found`)
    }

    if (addresses) result.addresses = []
    if (transactions) result.transactions = []
    if (fullName) result.fullName = user.fullName

    let btcResults = await this.BtcService.getInfoByUser({
      user,
      totalBalance: balancesSumm,
      transactions,
      addresses
    })

    let ethResults = await this.EthService.getInfoByUser({
      user,
      totalBalance: balancesSumm,
      transactions,
      addresses
    })

    if (balancesSumm) {
      result.totalBtcBalance = btcResults.totalBalance
      result.totalEthBalance = ethResults.totalBalance
    }

    if (balancesSummEur) {
      result.totalBtcBalanceEur = await this.btcToEur(btcResults.totalBalance)
      result.totalEthBalanceEur = await this.ethToEur(ethResults.totalBalance)
    }

    /*
      Транзакции смешиваются в один массив
    */

    if (btcResults.transactions) {
      btcResults.transactions.forEach(element => {
        element.chain = WalletType.btc
        result.transactions.push(element)
      })
    }

    if (ethResults.transactions) {
      ethResults.transactions.forEach(element => {
        element.chain = WalletType.eth
        result.transactions.push(element)
      })
    }

    // TODO
    // Сортировка по времени
    // Самые свежие в начале

    /*
      Адреса всех кошельков пользователя смешиваются в единиый массив
    */

    if (addresses) {
      ethResults.addresses.forEach(address => {
        address.type = WalletType.eth
        result.addresses.push(address)
      })

      btcResults.addresses.forEach(address => {
        address.type = WalletType.btc
        result.addresses.push(address)
      })
    }

    return result
  }

  /*
    Получение списка пользователей с их кошельками
  */

  async getUsersWallets() {
    /*
      Получаем список пользователей и все их кошельки
    */
    let users = (await this.userRepository.find({
      join: {
        alias: 'user',
        leftJoinAndSelect: {
          btcWallets: 'user.btcWallets',
          ethWallets: 'user.ethWallets'
        }
      },
      where: { role: UserRole.client }
    })) as any

    let usersModel = []

    /*
      Здесь по каждому пользователю формируется объект
      Содержащий id пользователя 
      Его имя
      И список его кошельков (Кошельки смешанны)
    */
    users.forEach(element => {
      // console.log(element)

      let model = {
        id: element.id,
        fullName: element.fullName,
        wallets: []
      }

      element.__btcWallets__.forEach(wallet => {
        model.wallets.push({
          type: WalletType.btc,
          address: wallet.address,
          id: wallet.id
        })
      })

      element.__ethWallets__.forEach(wallet => {
        model.wallets.push({
          type: WalletType.eth,
          address: wallet.address,
          id: wallet.id
        })
      })

      usersModel.push(model)
    })

    return usersModel

    // let userRepository = getConnection().getRepository(User)

    // let users = await userRepository.find({
    //   relations: ['btcWallets', 'ethWallets'],
    //   select: ['id', 'btcWallets', 'ethWallets']
    // })

    // return users

    // return await query.getMany()
    // let users = await userRepository.find({
    //   relations: ['btcWallets', 'ethWallets.balance'],
    //   select: User.btcWallets
    // })

    // return await query.execute()

    // return users

    // query.find({
    //   join: ['']
    // })

    // const results = await query.find({
    //   where: { wallet: { id: In(ids) } },
    //   order: { time: 'ASC' },
    //   loadEagerRelations: false
    // })
  }
}
