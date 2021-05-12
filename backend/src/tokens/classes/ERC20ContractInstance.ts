import { web3http } from '../../helpers/web3'
import { TOKEN_ABI } from '../AbiToken'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'

export class ERC20ContractInstance {
  readonly contract: any

  readonly contractAddress: string
  readonly name: string
  readonly symbol: string
  readonly decimals: number

  constructor(readonly tokenType: ERC20TokenType) {
    this.contractAddress = tokenType.contractAddress
    this.name = tokenType.name
    this.symbol = tokenType.symbol
    this.decimals = tokenType.decimals

    this.contract = new web3http.eth.Contract(
      TOKEN_ABI,
      tokenType.contractAddress
    )
  }

  async getAddressBalance(address: string) {
    let request = this.contract.methods.balanceOf(address).call()
    let balance = await request

    console.log(`Balance requested`)

    balance = this.tokenType.numToTokenValue(+balance)

    console.log(`Balance is `, balance)

    return balance
  }
}
