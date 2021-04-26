import { web3http } from '../web3'
import { TOKEN_ABI } from '../AbiToken'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'

export class ERC20ContractService {
  readonly contractInstance: any
  private numForDevide: number

  readonly contractAddress: string
  readonly name: string
  readonly symbol: string
  readonly decimals: number

  constructor(readonly tokenType: ERC20TokenType) {
    this.contractAddress = tokenType.contractAddress
    this.name = tokenType.name
    this.symbol = tokenType.symbol
    this.decimals = tokenType.decimals

    this.contractInstance = new web3http.eth.Contract(
      TOKEN_ABI,
      tokenType.contractAddress
    )

    if (tokenType.decimals > 0) {
      this.numForDevide = Math.pow(10, tokenType.decimals)
    }
  }

  async getAddressBalance(address: string) {
    let request = this.contractInstance.methods.balanceOf(address).call()
    let balance = await request

    console.log(`Balance requested`)

    if (balance && this.decimals > 0) {
      balance = balance / this.numForDevide
    }

    console.log(`Balance is `, balance)

    return balance
  }
}
