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
import { WalletBTC } from '../../wallet/entities/Wallet-btc.entity'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'

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

  @OneToMany(type => WalletBTC, walletBtc => walletBtc.user, {
    eager: false,
    cascade: true
  })
  btcWallets: Promise<WalletBTC[]>

  @OneToMany(type => WalletETH, walletEth => walletEth.user, {
    eager: false,
    cascade: true
  })
  ethWallets: Promise<WalletETH[]>

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt)
    return hash === this.password
  }
}
