import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { ERC20Token } from './ERC20-token.entity'

@Entity()
@Index(['hash', 'token'], { unique: true })
export class ERC20Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  type: boolean

  @Column({ unique: true })
  hash: string

  @Column()
  from: string

  @Column()
  to: string

  @Column('timestamp')
  time: Date

  @Column('decimal', { precision: 40, scale: 18 })
  value: number

  @ManyToOne(type => ERC20Token, token => token.transactions, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false
  })
  token: ERC20Token
}
