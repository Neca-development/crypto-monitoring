import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp
} from 'typeorm'
import { WalletBTC } from './Wallet-btc.entity'

/*
{
    type: 'timestamp',
    name: 'lastUpdate',
    default: () => 'TIMESTAMP'
  }
*/

@Entity()
export class TransactionBTC extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: boolean

  @Column()
  hash: string

  @Column('timestamp', { nullable: true })
  time: Date

  @Column()
  from: string

  @Column()
  to: string

  @Column('decimal', { precision: 30, scale: 8 })
  value: number

  @ManyToOne(type => WalletBTC, wallet => wallet.transactions, {
    eager: true,
    onDelete: 'CASCADE'
  })
  wallet: WalletBTC
}
