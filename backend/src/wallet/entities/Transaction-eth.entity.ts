import { EthTsxHashtag } from 'src/hashtags/entitites/hashtag-tsx.eth.entity'
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { WalletETH } from './Wallet-eth.entity'

/*
  {
      type: 'timestamp',
      name: 'lastUpdate',
      default: () => 'TIMESTAMP'
    }
  */

/*
  @Column('decimal', { precision: 27, scale: 18 })
  value: number
*/

@Entity()
@Index(['hash', 'wallet'], { unique: true })
export class TransactionETH extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: boolean

  @Column()
  hash: string

  @Column()
  from: string

  @Column()
  to: string

  @Column('timestamp')
  time: Date

  @Column('decimal', { precision: 40, scale: 18 })
  value: number

  @ManyToOne(type => WalletETH, wallet => wallet.transactions, {
    eager: true,
    onDelete: 'CASCADE'
  })
  wallet: WalletETH

  @OneToMany(type => EthTsxHashtag, hashtag => hashtag.transaction, {
    eager: false,
    cascade: true
  })
  hashtags: Promise<EthTsxHashtag[]>
}
