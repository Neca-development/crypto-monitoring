import { InternalServerErrorException, Logger } from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'

import { RefreshToken } from './refreshToken.entity'
import { User } from 'src/auth/user/user.entity'

@EntityRepository(RefreshToken)
export class RefreshTokenRepository extends Repository<RefreshToken> {
  /* 
      Метод генерирует рефреш токен из accessToken-а + соли
      Так-же зашивает в рефреш токен имя пользователя,
      Которое используется для генерации payload-а access токена, при обновлении пары access+refresh токенов
    */

  private readonly logger = new Logger(RefreshTokenRepository.name)

  async generateRefreshToken(accessToken: string, user: User): Promise<string> {
    const salt = await bcrypt.genSalt(10)

    const refreshToken = new RefreshToken()
    refreshToken.user = user
    refreshToken.hash = await bcrypt.hash(
      accessToken.split('.')[2] + salt,
      salt
    )

    try {
      await refreshToken.save()
      return salt
    } catch (e) {
      this.logger.error(`Cannot create refresh token for user ${user}`, e.stack)
      throw new InternalServerErrorException()
    }
  }
}
