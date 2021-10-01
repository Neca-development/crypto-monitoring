import { User } from 'src/auth/user/user.entity'

export interface IGetUserWalletsInfo {
  user: User
  totalBalance?: boolean
  addresses?: boolean
  transactions?: boolean
}
