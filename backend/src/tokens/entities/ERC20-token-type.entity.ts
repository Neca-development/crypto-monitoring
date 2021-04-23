import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ERC20Token } from './ERC20-token.entity'

@Entity()
export class ERC20TokenType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false, unique: true })
  contractAddress: string

  @Column({ nullable: false, unique: true })
  name: string

  @Column({ nullable: false, unique: true })
  symbol: string

  @Column({ nullable: false })
  decimals: number

  @OneToMany(type => ERC20Token, token => token.type, {
    eager: false,
    cascade: true
  })
  erc20tokens: Promise<ERC20Token[]>
}
