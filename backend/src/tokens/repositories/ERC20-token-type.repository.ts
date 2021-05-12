import { Logger } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'
import SupportedTypes from './ERC20SupportedTokens.json'
import SupportedRopstenTypes from './ERC20SupportedTokens.ropsten.json'

@EntityRepository(ERC20TokenType)
export class ERC20TokenTypeRepository extends Repository<ERC20TokenType> {
  private readonly logger = new Logger(ERC20TokenTypeRepository.name)

  async onModuleInit() {
    this.logger.log(`ERC20Token type service initialized`)
    let types = await this.find()
    await this.remove(types)

    let supportedTypes

    if (process.env.NODE_ENV == 'production') {
      supportedTypes = SupportedTypes
    } else {
      supportedTypes = SupportedRopstenTypes
    }

    for await (let supportedType of supportedTypes) {
      let type = this.create()
      type.symbol = supportedType.symbol
      type.decimals = supportedType.decimals
      type.contractAddress = supportedType.contractAddress
      type.name = supportedType.name

      try {
        await type.save()
      } catch (e) {}
    }
    this.logger.log(`${ERC20TokenTypeRepository.name} initialized`)
  }
  async getAllTypes() {
    return await this.find()
  }
}
