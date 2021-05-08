import { ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { dbErrorCodes } from 'src/config/db-error-codes'
import { TransactionETH } from 'src/wallet/entities/Transaction-eth.entity'
import { EntityRepository, Repository } from 'typeorm'
import { EthTsxHashtag } from '../entitites/hashtag-tsx.eth.entity'

@EntityRepository(EthTsxHashtag)
export class EthTsxHashtagRepository extends Repository<EthTsxHashtag> {
  private readonly logger = new Logger(EthTsxHashtagRepository.name)

  async addHashTagToTsx(transcation: TransactionETH, text: string) {
    const newHashtag = this.create()
    newHashtag.text = text
    newHashtag.transaction = transcation


    try {
      return await newHashtag.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        this.logger.debug(`Duplicate hasthag found`, e.stack)
        throw new ConflictException(`Hashtag already exists on this transaction`)
      }
      this.logger.error(`Cannot add hasthag to db`, e.stack)
      throw new InternalServerErrorException('Cannot add hasthag')
    }
  }

  async deleteHashtagByID(id: number) {
    const hashtag = await this.findOne({ id })
    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${id} not found`)
    }

    return await hashtag.remove()
  }

  async editHashtag(hashtagID: number, props: { newText?: string }) {
    const { newText } = props
    const hashtag = await this.findOne({ id: hashtagID })

    if (!hashtag) {
      throw new NotFoundException(`Hashtag with id ${hashtagID} not found`)
    }

    if (newText) {
      hashtag.text = newText
    }

    try {
      return await hashtag.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        this.logger.debug(`Duplicate hastag edit found`, e.stack)
        throw new ConflictException(`Hashtag with given updates already exists`)
      }
      this.logger.error(`Cannot add hasthag to db`, e.stack)
      throw new InternalServerErrorException('Cannot add hasthag')
    }
  }
}