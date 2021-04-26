import { User } from 'src/auth/user/user.entity'
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'

/*
 @hash: Хэш bcrypt-а, составленный из access+refresh токенов
*/
@Entity()
export class RefreshToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  hash: string

  @ManyToOne(type => User, user => user.refreshTokens, {
    eager: true,
    onDelete: 'CASCADE'
  })
  user: User
}
