import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { UserRole } from '../enum/user-role.enum'
import { RefreshToken } from '../jwt/refreshToken/refreshToken.entity'

/* 
   @password: Хешированый с помощью bcrypt-а пароль
   @salt: Bcrypt соль, с помощью которой можно валидировать полученный от пользователя пароль
*/

/*
  Клиент является пользователем с ролью client
*/

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true, nullable: true })
  email: string

  @Column({ unique: true, nullable: true })
  fullName: string

  @Column()
  role: UserRole

  @Column({ nullable: true })
  password: string

  @Column({ nullable: true })
  salt: string

  @OneToMany(type => RefreshToken, refreshToken => refreshToken.user, {
    eager: false,
    cascade: true
  })
  refreshTokens: Promise<RefreshToken[]>

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt)
    return hash === this.password
  }
}
