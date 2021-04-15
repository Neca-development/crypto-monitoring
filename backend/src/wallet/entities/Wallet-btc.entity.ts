import { User } from '../../auth/user/user.entity'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { TransactionBTC } from './Transaction-btc.entity'

@Entity()
export class WalletBTC extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  address: string

  @Column('decimal', { precision: 12, scale: 8 })
  balance: number

  @ManyToOne(type => User, user => user.btcWallets, {
    eager: true,
    cascade: false,
    onDelete: 'CASCADE'
  })
  user: User

  @OneToMany(type => TransactionBTC, transaction => transaction.wallet, {
    eager: false,
    cascade: true
  })
  transactions: Promise<TransactionBTC[]>
}