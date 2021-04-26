import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ERC20TokenType } from './ERC20-token-type.entity'
import { ERC20Transaction } from './ERC20-transaction.entity'

@Entity()
@Index(['wallet', 'type'], { unique: true })
export class ERC20Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('decimal', { precision: 40, scale: 18 })
  balance: number

  @ManyToOne(type => WalletETH, wallet => wallet.erc20tokens, {
    eager: true,
    cascade: false,
    onDelete: 'CASCADE'
  })
  wallet: WalletETH

  @ManyToOne(type => ERC20TokenType, type => type.erc20tokens, {
    eager: true,
    cascade: false,
    onDelete: 'CASCADE',
    nullable: false
  })
  type: ERC20TokenType

  @OneToMany(type => ERC20Transaction, transaction => transaction.token, {
    eager: false,
    cascade: true
  })
  transactions: Promise<ERC20Transaction[]>
}
