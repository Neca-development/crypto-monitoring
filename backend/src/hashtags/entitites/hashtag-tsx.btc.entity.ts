import { TransactionBTC } from 'src/wallet/entities/Transaction-btc.entity'
import {
    BaseEntity,
    Column,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn
  } from 'typeorm'

  @Entity()
  @Index(['transaction', 'text'], { unique: true })
  export class BtcTsxHahstag extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    text: string

    @ManyToOne(type => TransactionBTC, type => type.hashtags, {
      eager: true,
      cascade: false,
      onDelete: 'CASCADE',
      nullable: false
    })
    transaction: TransactionBTC
  }
