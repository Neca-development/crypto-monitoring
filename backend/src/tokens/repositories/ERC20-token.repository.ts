import { EntityRepository, Repository } from 'typeorm'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'
import { ERC20Token } from '../entities/ERC20-token.entity'

@EntityRepository(ERC20Token)
export class ERC20TokenRepository extends Repository<ERC20Token> {
  async getAllTokens() {
    return await this.find()
  }

  async getTokenByWalletId(walletID: number) {
    const token = await this.findOne({
      where: { wallet: { id: walletID } },
      loadEagerRelations: false
    })
    return token
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
}
