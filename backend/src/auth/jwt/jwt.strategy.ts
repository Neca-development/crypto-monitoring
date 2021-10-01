import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { InjectRepository } from '@nestjs/typeorm'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { JwtPayload } from './jwt-payload.interface'
import { UserRepository } from '../user/user.repository'
import Config from 'config'

let jwtConfig: any = Config.get('jwt')

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || jwtConfig.secret
    })
  }

  async validate(payload: JwtPayload) {
    const { userID } = payload
    const user = await this.userRepository.findOne({ id: userID })

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
