import { User } from 'src/auth/user/user.entity'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { TransactionETH } from './Transaction-eth.entity'

@Entity()
export class WalletETH extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  address: string

  @Column('decimal', { precision: 50, scale: 18 })
  balance: number

  @ManyToOne(type => User, user => user.ethWallets, {
    eager: true,
    cascade: false,
    onDelete: 'CASCADE'
  })
  user: User

  @OneToMany(type => TransactionETH, transaction => transaction.wallet, {
    eager: false,
    cascade: true
  })
  transactions: Promise<TransactionETH[]>
}
