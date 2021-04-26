import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Timestamp
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

  @Column('timestamp', { nullable: true })
  time: Date

  @Column('decimal', { precision: 40, scale: 18 })
  value: number

  @ManyToOne(type => WalletETH, wallet => wallet.transactions, {
    eager: true,
    onDelete: 'CASCADE'
  })
  wallet: WalletETH
}
