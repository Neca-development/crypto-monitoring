import { TransactionETH } from 'src/wallet/entities/Transaction-eth.entity'
import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
  } from 'typeorm'

  @Entity()
  export class EthTsxHashtag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    text: string

    @ManyToOne(type => TransactionETH, type => type.hashtags, {
      eager: true,
      cascade: false,
      onDelete: 'CASCADE',
      nullable: false
    })
    transaction: TransactionETH
}