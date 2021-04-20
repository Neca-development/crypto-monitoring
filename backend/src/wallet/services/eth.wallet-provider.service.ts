import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import * as Web3 from 'web3'
import { TransactionEthModel } from '../entities/Transaction-eth.model'
import { WalletEthModel } from '../entities/Wallet-eth.model'

/*
  Mainnet infura
  http: https://mainnet.infura.io/v3/28b42a756903430db51aed449ff78ad6
  ws: wss://mainnet.infura.io/ws/v3/28b42a756903430db51aed449ff78ad6

  Test:
  http: https://ropsten.infura.io/v3/43adaa094d794787ba472b1e7d7e00c6
  wss: wss://ropsten.infura.io/ws/v3/43adaa094d794787ba472b1e7d7e00c6
*/

@Injectable()
export class EthWalletProviderService {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(EthWalletProviderService.name)

  private infuraUrl =
    'https://mainnet.infura.io/v3/28b42a756903430db51aed449ff78ad6'

  private infuraTestUrl =
    'https://ropsten.infura.io/v3/43adaa094d794787ba472b1e7d7e00c6'

  private etherscanApiKey = 'Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV'

  private web3 = new Web3.default(this.infuraTestUrl)

  async getEthWallet(address: string) {
    let balance: string

    try {
      balance = await this.web3.eth.getBalance(address)
      this.logger.log(`Balance is ${balance}`)
    } catch (e) {
      this.logger.log(`Cannot get wallet with address ${address}`, e.stack)
      throw new BadRequestException(`Wallet with address ${address} not found`)
    }

    let response: any

    // Mainnet url https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.etherscanApiKey}&offset=30&page=1
    // Test url https://api-ropsten.etherscan.io/api?module=account&action=txlist&sort=desc&address=${address}&startblock=0&endblock=99999999&page=1&offset=30&apikey=XV7IHEB5WHVI9XKTMHUMW9YYQ4RBTUEFZ5
    // Сортировка Asc - айдишники идут последовательно, самая старая операция - самый большой id

    try {
      response = await this.httpService
        .get(
          `https://api-ropsten.etherscan.io/api?module=account&action=txlist&sort=desc&address=${address}&startblock=0&endblock=99999999&page=1&offset=30&apikey=XV7IHEB5WHVI9XKTMHUMW9YYQ4RBTUEFZ5`,
          {}
        )
        .toPromise()
    } catch (e) {
      this.logger.error(
        `Cannot get transactions from etherscan for address ${address}`,
        e.stack,
        JSON.stringify(response.data)
      )

      throw new InternalServerErrorException(
        `Cannot get transactions from etherscan for address ${address}`
      )
    }

    if (response.data.message != 'OK') {
      this.logger.error(
        `Cannot get transactions for addres ${address}`,
        JSON.stringify(response.data)
      )

      throw new BadRequestException(
        'Cannot get get transactions for this address, try later'
      )
    }

    let wallet: WalletEthModel = {
      balance: +balance,
      address,
      transactions: []
    }

    response.data.result.forEach(element => {
      if (element.value == 0) {
        return
      }
      let type = element.to == address.toLowerCase() ? true : false
      let transaction: TransactionEthModel = {
        type,
        time: new Date(element.timeStamp * 1000),
        from: element.from,
        to: element.to,
        hash: element.hash,
        value: +element.value
      }

      wallet.transactions.push(transaction)
    })

    wallet.transactions.reverse()

    // console.log(wallet)
    return wallet
  }
}
