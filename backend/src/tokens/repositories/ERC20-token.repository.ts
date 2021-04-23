import { EntityRepository, Repository } from 'typeorm'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'
import { ERC20Token } from '../entities/ERC20-token.entity'

@EntityRepository(ERC20Token)
export class ERC20TokenRepository extends Repository<ERC20Token> {
  async getAllTypes() {
    return await this.find()
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
