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

  @Column({ unique: true })
  contractAddress: string

  @Column({ unique: true })
  name: string

  @Column({ unique: true })
  symbol: string

  @Column()
  decimals: number

  @OneToMany(type => ERC20Token, token => token.type, {
    eager: false,
    cascade: true
  })
  erc20tokens: Promise<ERC20Token[]>

  numToTokenValue(number: number) {
    if (this.decimals > 0 && number > 0) {
      number = number / Math.pow(10, this.decimals)
    }

    return number
  }
}
