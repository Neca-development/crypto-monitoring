import { User } from 'src/auth/user/user.entity'
import { ERC20Token } from 'src/tokens/entities/ERC20-token.entity'
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

  @Column('decimal', { precision: 40, scale: 18 })
  balance: number

  @Column('decimal', { precision: 30, scale: 18, nullable: true })
  mediumBuyPrice: number

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

  @OneToMany(type => ERC20Token, token => token.wallet, {
    eager: false,
    cascade: true
  })
  erc20tokens: Promise<ERC20Token[]>
}
