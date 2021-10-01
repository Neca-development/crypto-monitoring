import { ERC20TsxHashtag } from 'src/hashtags/entitites/hashtag-tsx-erc20.entity'
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
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

  @Column('decimal', { precision: 30, scale: 18, nullable: true })
  fee: number

  @ManyToOne(type => ERC20Token, token => token.transactions, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false
  })
  token: ERC20Token

  @OneToMany(type => ERC20TsxHashtag, hashtag => hashtag.transaction, {
    eager: false,
    cascade: true
  })
  hashtags: Promise<ERC20TsxHashtag[]>
}
