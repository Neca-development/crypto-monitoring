import { HttpService, Injectable, Logger } from '@nestjs/common'
import { IERC20TranscationModel } from '../interfaces/IERC20Transaction'
import { IERC20TokenModel } from '../interfaces/IERC20Token'
import { ERC20ContractsService } from './erc20-contracts.service'
import { NumToEth } from 'src/helpers/NumToEth'

/*
  Сервис взаимодействует со сторонними api
  Для получения информации по токенам и их транзакциям
*/

@Injectable()
export class ERC20TokenProviderService {
  private readonly logger = new Logger(ERC20TokenProviderService.name)

  private etherscanApiKey = 'Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV'

  constructor(
    private erc20ContractsService: ERC20ContractsService,
    private httpService: HttpService
  ) {}

  async getTokensByAddress(address: string) {
    let tokens = await this.erc20ContractsService.getTokensForAddress(address)
    this.logger.debug(`Tokens is`)
    console.log(tokens)

    for await (let token of tokens) {
      let transactions: IERC20TranscationModel[] = await this.getTokenTransactions(
        address,
        token
      )

      this.logger.debug(`Transactions for token`)

      token.transactions = transactions
    }

    this.logger.debug(`Tokens for address ${address}`)
    console.log(tokens)
    return tokens
  }

  /*
    Возвращает транзакции в asc порядке по времени
  */

  async getTokenTransactions(
    ethWalletAddress: string,
    token: IERC20TokenModel
  ) {
    let requestUrl = `https://api.etherscan.io/api?module=account&action=tokentx&address=${ethWalletAddress}&startblock=0&endblock=999999999&page=1&offset=100&sort=desc&apikey=${this.etherscanApiKey}`

    let result = await this.httpService.get(requestUrl).toPromise()

    let rawTransactions = result.data.result

    let transactions: IERC20TranscationModel[] = []

    if (rawTransactions.length) {
      transactions = this.transformTransactions(
        rawTransactions,
        ethWalletAddress,
        token.type.symbol
      )
    }

    return transactions
  }

  /*
    Возвращает транзакции в asc порядке по времени
  */

  private transformTransactions(
    rawTransactions: any,
    address: string,
    _tokenSymbol: string
  ) {
    let transactions: IERC20TranscationModel[] = []

    rawTransactions.forEach(tsx => {
      if (tsx.tokenSymbol != _tokenSymbol) {
        return
      }

      if (tsx.value == 0) {
        return
      }

      let type = tsx.to == address.toLowerCase() ? true : false
      let transaction: IERC20TranscationModel = {
        type,
        time: new Date(tsx.timeStamp * 1000),
        from: tsx.from,
        to: tsx.to,
        hash: tsx.hash,
        value: +tsx.value,
        fee: NumToEth(+tsx.gasPrice) * +tsx.gasUsed
      }

      if (+tsx.tokenDecimal > 0) {
        transaction.value = transaction.value / Math.pow(10, +tsx.tokenDecimal)
      }

      transactions.push(transaction)
    })

    return transactions.reverse()
  }
}
//0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
//this.web3.utils.sha3('Transfer(address,address,uint256)')

//0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
// console.log(
//   this.web3.eth.abi.encodeEventSignature(
//     'Transfer(address,address,uint256)'
//   )
// )

// var subscription2 = this.web3.eth
//   .subscribe(
//     'logs',
//     {
//       address: '0xc778417e063141139fce010982780140aa0cd5ab',
//       topics: [
//         '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
//       ]
//     },
//     function (error, result) {
//       if (!error) console.log(result)
//     }
//   )
//   .on('data', result => {
//     const eventObj = this.web3.eth.abi.decodeLog(
//       TOKEN_ABI.inputs,
//       result.data,
//       result.topics.slice(1)
//     )

//     console.log(eventObj)
//   })
//   .on('error', err => {
//     console.log(`Err found`, err)
//   })

//    tokenInst.methods
//   .balanceOf('0x687422eEA2cB73B5d3e242bA5456b782919AFc85')
//   .call()
//   .then(function (bal) {
//     console.log(bal / 100000000000000000)
//   })

// const decimals = tokenInst.methods
//   .decimals()
//   .call()
//   .then(decimal => {
//     console.log(decimal)
//   })
// console.log(decimals)

// const events = tokenInst.events.Transfer().arguments
// console.log(events)

// const subscribedEvents = {}
// // Subscriber method

// subscribeLogEvent(tokenInst, 'Transfer')
// }
