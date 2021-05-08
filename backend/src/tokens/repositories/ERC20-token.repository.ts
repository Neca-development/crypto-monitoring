import { EntityRepository, Repository } from 'typeorm'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'
import { ERC20Token } from '../entities/ERC20-token.entity'
import { IERC20TknTotalBalance } from '../SubTypes/IERC20TknTotalBalance'

@EntityRepository(ERC20Token)
export class ERC20TokenRepository extends Repository<ERC20Token> {
  async getAllTokens() {
    return await this.find()
  }

  async getTokenByWalletAddress(props: {
    address: string
    tokenType: ERC20TokenType
  }) {
    let query = this.createQueryBuilder('token')

    query
      .innerJoin('token.wallet', 'wallet')
      .innerJoin('token.type', 'type')
      .where('wallet.address = :walletAddress', {
        walletAddress: props.address
      })
      .andWhere('type.symbol = :typeSymbol', {
        typeSymbol: props.tokenType.symbol
      })

    return await query.getOne()
  }

  async getTssxsByIds(ids: number) {
    const query = this.createQueryBuilder('token')
    query
      .innerJoin('token.transactions', 'transaction')
      .innerJoin('token.type', 'type')
      .select('transaction.type AS type')
      .addSelect('type.name as tokenType')
      .addSelect('transaction.id AS id')
      .addSelect('transaction.type as type')
      .addSelect('transaction.hash as hash')
      .addSelect('transaction.from as from')
      .addSelect('transaction.to as to')
      .addSelect('transaction.time as time')
      .addSelect('transaction.value as value')

    return await query.getRawMany()
  }

  async getTokensByWalletId(walletID: number, options?: { type?: boolean }) {
    let query = this.createQueryBuilder('token')
    query.innerJoin('token.wallet', 'wallet').where('wallet.id = :walletID', {
      walletID
    })

    const selections = ['token']

    if (options) {
      if (options.type) {
        query.innerJoin('token.type', 'type')
        selections.push('type')
      }
    }

    query.select(selections)

    let result = await query.getMany()

    return result
  }

  async createToken(props: {
    balance: number
    type: ERC20TokenType
  }): Promise<ERC20Token> {
    let token = this.create()
    token.balance = props.balance
    token.type = props.type
    await token.save()
    return token
  }

  // async onModuleInit() {
  //   const result = await this.getUserBalancesSum(15)
  //   console.log(`Result is`)
  //   console.log(result)
  // }

  /*
    Получение суммы балансов токенов по всем кошелькам пользователя
  */

  async getUserBalancesSum(userID: number): Promise<IERC20TknTotalBalance[]> {
    let query = this.createQueryBuilder('token')
    query
      .innerJoin('token.wallet', 'wallet')
      .innerJoin('token.type', 'type')
      .innerJoin('wallet.user', 'user')
      .where('wallet.userId = :userID', { userID })
      .groupBy('type.contractAddress')
      .addGroupBy('type.name')
      .addGroupBy('type.symbol')
      .addGroupBy('type.id')

    query.select([
      'type.id as id',
      'type.name as name',
      'type.contractAddress as contract_address',
      'SUM(token.balance)'
    ])
    return await query.getRawMany()
  }

  /*
    Получение суммы балансов по всем имеющимся у пользователей токенов
  */

  async getAllBalancesSumm(): Promise<IERC20TknTotalBalance[]> {
    let query = this.createQueryBuilder('token')
    query
      .innerJoin('token.wallet', 'wallet')
      .innerJoin('token.type', 'type')
      .innerJoin('wallet.user', 'user')
      .groupBy('type.contractAddress')
      .addGroupBy('type.name')
      .addGroupBy('type.symbol')
      .addGroupBy('type.id')

    query.select([
      'type.id as id',
      'type.name as name',
      'type.contractAddress as contract_address',
      'SUM(token.balance)'
    ])

    return await query.getRawMany()
  }
}
