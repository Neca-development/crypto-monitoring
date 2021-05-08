import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ERC20ContractInstance } from '../classes/ERC20ContractInstance'
import { IERC20TokenModel } from '../interfaces/IERC20Token'
import { ERC20TokenTypeRepository } from '../repositories/ERC20-token-type.repository'
import { web3http, web3wss } from '../web3'
import * as _ from 'lodash'
import { EthWalletsPool } from '../classes/ETHWalletsPool'
import { IERC20TranscationModel } from '../interfaces/IERC20Transaction'
import { ERC20TokenRepository } from '../repositories/ERC20-token.repository'
import { ERC20TransactionRepository } from '../repositories/ERC20-transaction.repository'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'
import { EthRepository } from 'src/wallet/repositories/eth.repository'
import { hash } from 'bcrypt'
import { NumToEth } from 'src/helpers/NumToEth'

/*
  Сервис отвечающий за взаимодействие web3 и контрактами токенов
  Так-же отвечает за мониторинг транзакций токенов
*/
@Injectable()
export class ERC20ContractsService {
  private logger = new Logger(ERC20ContractsService.name)
  private contractInstances: Map<string, ERC20ContractInstance> = new Map()

  constructor(
    @InjectRepository(ERC20TokenTypeRepository)
    private tokenTypeRepository: ERC20TokenTypeRepository,
    private ETHWalletsPool: EthWalletsPool,
    @InjectRepository(ERC20TokenRepository)
    private tokenRepository: ERC20TokenRepository,
    @InjectRepository(ERC20TransactionRepository)
    private transactionRepository: ERC20TransactionRepository,
    @InjectRepository(EthRepository)
    private ethRepository: EthRepository
  ) {}

  async onModuleInit() {
    let types = await this.tokenTypeRepository.getAllTypes()

    types.forEach(type => {
      let contractInstance = new ERC20ContractInstance(type)
      this.contractInstances.set(type.name, contractInstance)
      this.subscribeForNewTransactions(contractInstance)
    })

    this.logger.log(`${ERC20ContractsService.name} initialized`)
    console.log(types)
  }

  async getTokensForAddress(address: string) {
    let tokens: IERC20TokenModel[] = []

    for await (let contract of this.contractInstances) {
      let balance = await contract[1].getAddressBalance(address)
      this.logger.debug(`Balance for address ${address} is ${balance}`)

      if (balance > 0) {
        this.logger.debug(`Balance found: ${balance}`)
        let token: IERC20TokenModel = {
          balance,
          type: contract[1].tokenType,
          transactions: []
        }
        this.logger.debug(`Created new token`)
        tokens.push(token)
      }
    }

    return tokens
  }

  walletExists(address: string): boolean {
    return this.ETHWalletsPool.walletExists(address)
  }

  private async subscribeForNewTransactions(
    contractService: ERC20ContractInstance
  ) {
    const eventJsonInterface = _.find(
      contractService.contract._jsonInterface,
      o => o.name === 'Transfer' && o.type === 'event'
    )
    const subscription = web3wss.eth.subscribe(
      'logs',
      {
        address: contractService.contract.options.address,
        topics: [eventJsonInterface.signature]
      },
      async (error, result) => {
        if (error) {
          this.logger.error(`Error found in subscribe`)
          console.log(error)
        }
        if (!error) {
          const eventObj = web3wss.eth.abi.decodeLog(
            eventJsonInterface.inputs,
            result.data,
            result.topics.slice(1)
          )
          this.logger.log(`New ERC20 token transaction!`)
          console.log(eventObj)
          console.log(result)

          this.logger.debug(`Eth wallets map is`)
          console.log(this.ETHWalletsPool.walletAdresses)


          this.proccesNewTransaction(
            {
              hash: result.transactionHash,
              from: eventObj.from,
              to: eventObj.to,
              value: eventObj.tokens
            },
            contractService
          )
        }
      }
    )
  }

  private async proccesNewTransaction(
    props: { hash: string; from: string; to: string; value: string },
    contractInstance: ERC20ContractInstance
  ) {
    if (+props.value === 0) {
      return
    }

    this.logger.debug(`proccesNewTransaction executed`)
    console.log(props)

    props.to = props.to.toLowerCase()
    props.from = props.from.toLowerCase()

    let walletFrom = this.walletExists(props.from)
    let walletTo = this.walletExists(props.to)

    if (walletFrom || walletTo) {
      this.logger.debug(`Some wallet found!`)

      this.logger.debug(`Map now`)
      console.log(this.ETHWalletsPool.walletAdresses)

      let date = new Date()
      date.setMilliseconds(0)
      let dateWithoutMs = new Date(date)

      let extendnTxnInfo = await web3http.eth.getTransaction(props.hash)
      this.logger.debug(`Extended info about token txn is`)
      console.log(extendnTxnInfo)
      let transaction: IERC20TranscationModel = {
        type: true,
        time: dateWithoutMs,
        from: props.from,
        to: props.to,
        hash: props.hash,
        value: contractInstance.tokenType.numToTokenValue(+props.value),
        fee: NumToEth(+extendnTxnInfo.gasPrice) * extendnTxnInfo.gas
      }

      if (walletTo) {
        transaction
        transaction.type = true
        this.addTransactionToAddress(
          transaction,
          contractInstance,
          transaction.to
        )
      }

      if (walletFrom) {
        transaction.type = false
        this.addTransactionToAddress(
          transaction,
          contractInstance,
          transaction.from
        )
      }
    }
  }

  private async addTransactionToAddress(
    tsx: IERC20TranscationModel,
    contractInstance: ERC20ContractInstance,
    address: string
  ) {
    this.logger.debug(`Transaction is`)
    console.log(tsx)

    contractInstance.tokenType
    let token = await this.tokenRepository.getTokenByWalletAddress({
      address,
      tokenType: contractInstance.tokenType
    })

    this.logger.debug(`Token is`)
    console.log(token)

    let newTokenCreated: boolean = false

    if (!token) {
      let wallet = await this.ethRepository.getWalletByAddress(address)
      token = await this.tokenRepository.createToken({
        balance: await contractInstance.getAddressBalance(address),
        type: contractInstance.tokenType
      })
      token.wallet = wallet
      newTokenCreated = true
      this.logger.debug(`Token not found, creating new token..`)
      console.log(token)
    }

    await this.transactionRepository.addTransactionByModel(tsx, token)

    if (!newTokenCreated) {
      if (tsx.type == true) {
        token.balance += tsx.value
      } else token.balance -= tsx.value
    }

    await token.save()

    this.logger.debug(`At the end token is`)
    console.log(token)
  }
}
