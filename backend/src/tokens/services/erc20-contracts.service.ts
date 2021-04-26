import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ERC20ContractService } from '../classes/ERC20ContractService'
import { IERC20TokenModel } from '../interfaces/IERC20Token'
import { ERC20TokenTypeRepository } from '../repositories/ERC20-token-type.repository'
import { web3wss } from '../web3'
import * as _ from 'lodash'
import { EthWalletsPool } from '../classes/ETHWalletsPool'

@Injectable()
export class ERC20ContractsService {
  private logger = new Logger(ERC20ContractsService.name)
  private contractTokenServices: Map<string, ERC20ContractService> = new Map()

  constructor(
    @InjectRepository(ERC20TokenTypeRepository)
    private erc20TokenTypeRepository: ERC20TokenTypeRepository,
    private ETHWalletsPool: EthWalletsPool
  ) {}

  async onModuleInit() {
    let types = await this.erc20TokenTypeRepository.getAllTypes()

    types.forEach(type => {
      let contractService = new ERC20ContractService(type)
      this.contractTokenServices.set(type.name, contractService)
    })

    this.logger.log(`ERC20 ContractsService initialized`)
  }

  async getTokensForAddress(address: string) {
    let tokens: IERC20TokenModel[] = []

    for await (let service of this.contractTokenServices) {
      let balance = await service[1].getAddressBalance(address)
      this.logger.debug(`Balance for address ${address} is ${balance}`)

      if (balance) {
        this.logger.debug(`Balance found: ${balance}`)
        let token: IERC20TokenModel = {
          balance,
          type: service[1].tokenType,
          transactions: []
        }
        this.logger.debug(`Created new token`)
        console.log(token)
        tokens.push(token)
      }
    }

    return tokens
  }

  subscribeForNewTransactions(contract, eventName) {
    const eventJsonInterface = _.find(
      contract._jsonInterface,
      o => o.name === eventName && o.type === 'event'
    )
    const subscription = web3wss.eth.subscribe(
      'logs',
      {
        address: contract.options.address,
        topics: [eventJsonInterface.signature]
      },
      async (error, result) => {
        console.log(result)
        if (!error) {
          const eventObj = web3wss.eth.abi.decodeLog(
            eventJsonInterface.inputs,
            result.data,
            result.topics.slice(1)
          )
          console.log(`New ${eventName}!`, eventObj)
        }
      }
    )
  }
}
