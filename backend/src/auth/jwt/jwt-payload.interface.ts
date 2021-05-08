import { UserRole } from '../enum/user-role.enum';

export interface JwtPayload {
  userID: number
  fullName: string
  role: UserRole
}
