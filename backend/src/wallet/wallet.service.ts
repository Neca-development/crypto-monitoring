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
import { HashtagAddToTsxDto } from 'src/dto/admin.add-hashtag.dto'
import { BtcTsxHashtagRepository } from 'src/hashtags/repositories/hashtag-tsx-btc.repository'
import { ERC20TsxHashtagRepository } from 'src/hashtags/repositories/hashtag-tsx.erc20.repository'
import { EthTsxHashtagRepository } from 'src/hashtags/repositories/hashtag-tsx.eth.repository'
import { TransactionType } from './enum/TransactionType.enum'
import { EthTransactionRepository } from './repositories/eth.transaction.repository'
import { BtcTransactionRepository } from './repositories/btc.transaction.repository'
import { ERC20TransactionRepository } from 'src/tokens/repositories/ERC20-transaction.repository'
import { HashtagDeleteDto } from 'src/dto/admin.delete-hashtag.dto'
import { HashtagEditDto } from 'src/dto/admin.edit-hashtag.dto'
import { ERC20TokenRepository } from 'src/tokens/repositories/ERC20-token.repository'
import { ERC20_TOKEN_TYPE } from 'src/tokens/enum/token-const'
import { VaultConvertationService } from '../convertation/vault-convertation.service'
import { ERC20TokenService } from 'src/tokens/services/erc20-token.service'
import { IERC20UserInfo } from 'src/tokens/SubTypes/IERC20UserInfo'

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
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(ERC20TsxHashtagRepository)
    private hashtagErc20Repository: ERC20TsxHashtagRepository,
    @InjectRepository(BtcTsxHashtagRepository)
    private hashtagBtcRepository: BtcTsxHashtagRepository,
    @InjectRepository(EthTsxHashtagRepository)
    private hashtagEthRepository: EthTsxHashtagRepository,
    @InjectRepository(EthTransactionRepository)
    private ethTransactionRepository: EthTransactionRepository,
    @InjectRepository(BtcTransactionRepository)
    private btcTransactionRepository: BtcTransactionRepository,
    @InjectRepository(ERC20TransactionRepository)
    private erc20transcationRepository: ERC20TransactionRepository,
    @InjectRepository(ERC20TokenRepository)
    private ERC20TokenRepository: ERC20TokenRepository,
    private vaultConvertationService: VaultConvertationService,
    private erc20tokenService: ERC20TokenService
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

    const {
      btcBalanceSumm,
      btcBalanceSummEur,
      ethBalanceSumm,
      ethBalanceSummEur,
      erc20BalancesSummEur
    } = getWalletsStatsDto

    if (ethBalanceSumm || ethBalanceSummEur) {
      response.ethBalanceSumm = await this.EthService.getWalletsSummBalance()
    }

    if (btcBalanceSumm || btcBalanceSummEur) {
      response.btcBalanceSumm = await this.BtcService.getWalletsSummBalance()
    }

    if (ethBalanceSummEur) {
      response.ethBalanceSummEur = await this.vaultConvertationService.ethToEur(
        response.ethBalanceSumm
      )
    }

    if (btcBalanceSummEur) {
      response.btcBalanceSummEur = await this.vaultConvertationService.btcToEur(
        response.btcBalanceSumm
      )
    }

    if (erc20BalancesSummEur) {
      let eurSum = 0
      const balances = await this.erc20tokenService.getTokenBalancesSumm()
      for await (let balance of balances) {
        eurSum += await this.vaultConvertationService.erc20toEur(
          balance.sum,
          balance.contract_address
        )
      }
      response.erc20BalancesSummEur = eurSum
    }

    return response
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
      balanceInEur,
      balanceHistory,
      erc20tokens,
      hashtags
    } = getWalletDto

    let wallet: any = {
      id: walletID,
      type
    }

    const props: IGetWalletProps = {
      walletID,
      transactions,
      user: holderName,
      tsxHashtags: hashtags
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
          wallet.balanceEur = await this.vaultConvertationService.btcToEur(
            wallet.balance
          )
          break
        }
        case WalletType.eth:
          wallet.balanceEur = await this.vaultConvertationService.ethToEur(
            wallet.balance
          )
          break

        default:
          throw new BadRequestException(`Invalid wallet type ${type}`)
      }
    }

    if (holderName) {
      wallet.holderName = result.user.fullName
    }


    if (balanceHistory) {
      wallet.balanceHistory = await this.getWalletBalanceHistory(
        walletID,
        type,
        30
      )
    }


    let erc20TokenTransactions = []

    /*
      Проверяем запрашиваются ли токены
      И запрашиваются ли транзакции
      Такое возможно только если кошель - эфировский
    */
    if (type == WalletType.eth) {
      if (erc20tokens) {
        wallet.erc20tokens = await this.ERC20TokenRepository.getTokensByWalletId(
          walletID,
          { type: true }
        )

        if (balanceInEur) {
          for await (let token of wallet.erc20tokens) {
            token.eur = await this.vaultConvertationService.erc20toEur(
              +token.balance,
              token.type.contractAddress
            )
          }
        }
        if (transactions) {
          let tokenIds = wallet.erc20tokens.map(token => {
            return token.id
          })

          erc20TokenTransactions = await this.erc20transcationRepository.getTsxsWithTokenTypes(
            tokenIds
          )
        }
      }
    }
    /*
      Добавляем свойство chain в транзакции
      Которе позволяет определить какого типа транзакция (ETH/TOKEN)
      Так-же смешиваем транзакции в единый массив
    */

    if (transactions) {
      wallet.transactions = result.transactions.map(tsx => {
        tsx.chain = type
        return tsx
      })

      if (erc20TokenTransactions) {
        erc20TokenTransactions.forEach(tsx => {
          tsx.chain = ERC20_TOKEN_TYPE
          wallet.transactions.push(tsx)
        })
      }
    }

    // console.log(wallet)

    return wallet
  }

  async onModuleInit() {
    // let walletTokens = await this.ERC20TokenRepository.getTokensByWalletId(1, { transactions: true })
    // console.log(`Wallet tokens is`)
    // console.log(walletTokens)
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
      transactions,
      balancesHistory
    } = userWalletsInfo

    const user: User = await this.userRepository.getUserById(userID)
    let result: any = {}

    if (!user) {
      throw new NotFoundException(`User with id ${userID} not found`)
    }

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

    let erc20tokensResult: IERC20UserInfo

    if (ethResults.addresses && ethResults.addresses.length) {
      erc20tokensResult = await this.erc20tokenService.getInfoByUser(user, {
        transactions,
        totalBalance: balancesSumm
      })
    }

    if (balancesSumm) {
      result.totalBtcBalance = btcResults.totalBalance
      result.totalEthBalance = ethResults.totalBalance
    }

    if (balancesSummEur) {
      result.totalBtcBalanceEur = await this.vaultConvertationService.btcToEur(
        btcResults.totalBalance
      )
      result.totalEthBalanceEur = await this.vaultConvertationService.ethToEur(
        ethResults.totalBalance
      )
      result.totalERC20BalanceEur = 0
      if (erc20tokensResult && erc20tokensResult.totalBalance) {
        for await (let balance of erc20tokensResult.totalBalance) {
          let eur = await this.vaultConvertationService.erc20toEur(
            balance.sum,
            balance.contract_address
          )
          result.totalERC20BalanceEur += eur
        }
      }
    }

    if (balancesHistory) {
      result.balanceHistory = await this.getUserBalanceHistory(user, 30)
    }

    if (addresses) result.addresses = []
    if (transactions) result.transactions = []

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

      if (erc20tokensResult && erc20tokensResult.transactions) {
        erc20tokensResult.transactions.forEach(element => {
          element.chain = ERC20_TOKEN_TYPE
          result.transactions.push(element)
        })
      }
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

  async getWalletBalanceHistory(
    walletID: number,
    type: WalletType,
    days: number
  ) {
    let wallet: any

    switch (type) {
      case WalletType.btc:
        wallet = await this.BtcService.getWallet({
          walletID,
          user: false,
          transactions: false
        })
        if (!wallet) {
          throw new NotFoundException(`Wallet with id  ${walletID} not found`)
        }
        return await this.BtcService.getWalletBalanceStats(days, wallet)
      case WalletType.eth:
        wallet = await this.EthService.getWallet({
          walletID,
          user: false,
          transactions: false
        })
        if (!wallet) {
          throw new NotFoundException(`Wallet with id  ${walletID} not found`)
        }
        return await this.EthService.getWalletBalanceStats(days, wallet)

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }
  }

  async addHashToTransaction(addHashtagDto: HashtagAddToTsxDto) {
    const { type, transactionID, text } = addHashtagDto

    let tsx: any
    switch (type) {
      case TransactionType.btc:
        tsx = await this.btcTransactionRepository.getTransactionById(
          transactionID
        )
        if (!tsx) {
          throw new NotFoundException(
            `Transaction with id ${transactionID} not found`
          )
        }
        return await this.hashtagBtcRepository.addHashTagToTsx(tsx, text)
      case TransactionType.eth:
        tsx = await this.ethTransactionRepository.getTransactionById(
          transactionID
        )
        if (!tsx) {
          throw new NotFoundException(
            `Transaction with id ${transactionID} not found`
          )
        }
        return await this.hashtagEthRepository.addHashTagToTsx(tsx, text)
      case TransactionType.erc20token:
        tsx = await this.erc20transcationRepository.getTransactionById(
          transactionID
        )
        if (!tsx) {
          throw new NotFoundException(
            `Transaction with id ${transactionID} not found`
          )
        }
        return await this.hashtagErc20Repository.addHashTagToTsx(tsx, text)

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }
  }

  async deleteHashtag(deleteHashtagDto: HashtagDeleteDto) {
    const { hashtagID, type } = deleteHashtagDto

    switch (type) {
      case TransactionType.btc:
        return await this.hashtagBtcRepository.deleteHashtagByID(hashtagID)
      case TransactionType.eth:
        return await this.hashtagEthRepository.deleteHashtagByID(hashtagID)
      case TransactionType.erc20token:
        return await this.hashtagErc20Repository.deleteHashtagByID(hashtagID)

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }
  }

  async editHashtag(edithHashtagDto: HashtagEditDto) {
    const { type, hashtagID, newText } = edithHashtagDto

    const props: any = {}

    if (newText) {
      props.newText = newText
    }

    switch (type) {
      case TransactionType.btc:
        return await this.hashtagBtcRepository.editHashtag(hashtagID, props)
      case TransactionType.eth:
        return await this.hashtagEthRepository.editHashtag(hashtagID, props)
      case TransactionType.erc20token:
        return await this.hashtagErc20Repository.editHashtag(hashtagID, props)

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }
  }

  /*
    Получение истории балансов по всем кошелькам пользователя
  */

  async getUserBalanceHistory(user: User, days: number) {
    let ethHistory = await this.EthService.getUserBalanceStats(days, user)
    let btcHistory = await this.BtcService.getUserBalanceStats(days, user)

    return {
      ethHistory,
      btcHistory
    }
  }
}
