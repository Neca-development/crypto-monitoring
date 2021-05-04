import { ERC20Transaction } from 'src/tokens/entities/ERC20-transaction.entity';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity()
@Index(['transaction', 'text'], { unique: true })
export class ERC20TsxHashtag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @ManyToOne(type => ERC20Transaction, type => type.hashtags, {
    eager: true,
    cascade: false,
    onDelete: 'CASCADE',
    nullable: false
  })
  transaction: ERC20Transaction
}
