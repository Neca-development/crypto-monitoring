import { HttpService, Injectable, Logger } from '@nestjs/common'
import * as _ from 'lodash'
import { ERC20ContractService } from './classes/ERC20ContractService'
import { ERC20TokenTypeRepository } from './repositories/ERC20-token-type.repository'
import { ERC20TokenType } from './entities/ERC20-token-type.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { ERC20TokenRepository } from './repositories/ERC20-token.repository'
import { ERC20Token } from './entities/ERC20-token.entity'
import { IERC20TranscationModel } from './interfaces/IERC20Transaction'
import { ERC20TransactionRepository } from './repositories/ERC20-transaction.repository'

@Injectable()
export class ERC20TokenProviderService {
  private readonly logger = new Logger(ERC20TokenProviderService.name)

  private contractTokenServices: Map<string, ERC20ContractService> = new Map()

  constructor(
    @InjectRepository(ERC20TokenTypeRepository)
    private erc20TokenTypeRepository: ERC20TokenTypeRepository,
    @InjectRepository(ERC20TokenRepository)
    private tokenRepository: ERC20TokenRepository,
    @InjectRepository(ERC20TransactionRepository)
    private transactionRepository: ERC20TransactionRepository,
    private httpService: HttpService
  ) {}

  private etherscanApiKey = 'Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV'

  async onModuleInit() {
    this.logger.log(`TokenService initialized`)

    let types = await this.erc20TokenTypeRepository.getAllTypes()

    types.forEach(type => {
      let contractService: ERC20ContractService = new ERC20ContractService(type)
      this.contractTokenServices.set(type.name, contractService)
    })
  }

  private async getTokens(address: string) {
    let tokens: ERC20Token[] = []

    for await (let service of this.contractTokenServices) {
      console.log(`In foreach`)
      let balance = await service[1].getAddressBalance(address)
      this.logger.debug(`Balance for address ${address} is ${balance}`)

      if (balance) {
        console.log(`Balance found`)
        let token = await this.createToken(balance, service[1].tokenType)
        if (token) {
          this.logger.debug(`Created new token`)
          console.log(token)
          tokens.push(token)
        }
      }
    }

    return tokens
  }

  async getTokensByAddress(address: string) {
    let tokens = await this.getTokens(address)
    this.logger.debug(`Tokens is`)
    console.log(tokens)

    tokens.forEach(async token => {
      let transactions: IERC20TranscationModel[] = await this.getTokenTransactions(
        address,
        token
      )

      this.logger.debug(`Transactions for token `)
      this.logger.debug(token)
      this.logger.debug(transactions)

      await this.transactionRepository.addTransactionsByModel(
        transactions.reverse(),
        token
      )
    })

    this.logger.debug(`Tokens for address ${address}`)
    this.logger.debug(tokens)
    return tokens
  }

  async createToken(balance: number, type: ERC20TokenType) {
    let token = await this.tokenRepository.createToken({ balance, type })
    return token
  }

  async getTokenTransactions(ethWalletAddress: string, token: ERC20Token) {
    // Не забыть добавить ropsten
    let requestUrl = `https://api-ropsten.etherscan.io/api?module=account&action=tokentx&address=${ethWalletAddress}&startblock=0&endblock=999999999&page=1&offset=100&sort=desc&apikey=${this.etherscanApiKey}`

    let result = await this.httpService.get(requestUrl).toPromise()

    let rawTransactions = result.data.result

    let transactions = this.transformTransactions(
      rawTransactions,
      ethWalletAddress,
      token.type.symbol
    )

    return transactions
  }

  private transformTransactions(
    rawTransactions: any,
    address: string,
    _tokenSymbol: string
  ) {
    let transactions: IERC20TranscationModel[] = []

    rawTransactions.forEach(tsx => {
      if (tsx.value == 0) {
        return
      }

      if (tsx.tokenSymbol != _tokenSymbol) {
        return
      }

      let type = tsx.to == address.toLowerCase() ? true : false
      let transaction: IERC20TranscationModel = {
        type,
        time: new Date(tsx.timeStamp * 1000),
        from: tsx.from,
        to: tsx.to,
        hash: tsx.hash,
        value: +tsx.value
      }

      if (+tsx.tokenDecimal > 0) {
        transaction.value = transaction.value / Math.pow(10, +tsx.tokenDecimal)
      }

      transactions.push(transaction)
    })

    return transactions
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
// const subscribeLogEvent = (contract, eventName) => {
//   const eventJsonInterface = _.find(
//     contract._jsonInterface,
//     o => o.name === eventName && o.type === 'event'
//   )
//   const subscription = this.web3.eth.subscribe(
//     'logs',
//     {
//       address: contract.options.address,
//       topics: [eventJsonInterface.signature]
//     },
//     async (error, result) => {
//       console.log(result)
//       if (!error) {
//         const eventObj = this.web3.eth.abi.decodeLog(
//           eventJsonInterface.inputs,
//           result.data,
//           result.topics.slice(1)
//         )
//         console.log(`New ${eventName}!`, eventObj)
//         console.log(
//           await this.web3HTTP.eth.getTransaction(result.transactionHash)
//         )
//       }
//     }
//   )
//   subscribedEvents[eventName] = subscription
// }

// subscribeLogEvent(tokenInst, 'Transfer')
// }
