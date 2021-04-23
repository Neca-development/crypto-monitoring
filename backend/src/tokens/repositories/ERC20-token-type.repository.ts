import { Logger } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import { ERC20TokenType } from '../entities/ERC20-token-type.entity'
import { ERC20TransactionRepository } from './ERC20-transaction.repository'

@EntityRepository(ERC20TokenType)
export class ERC20TokenTypeRepository extends Repository<ERC20TokenType> {
  private readonly logger = new Logger(ERC20TokenTypeRepository.name)
  async onModuleInit() {
    try {
      let type = this.create()
      type.symbol = 'WEENUS'
      type.decimals = 18
      type.contractAddress = '0x101848d5c5bbca18e6b4431eedf6b95e9adf82fa'
      type.name = 'Weenus'
      await type.save()
    } catch (e) {}
    this.logger.log(`${ERC20TokenTypeRepository.name} initialized`)
  }

  async getAllTypes() {
    return await this.find()
  }
}
