import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcryptjs'

import { UserRepository } from './user/user.repository'
import { RefreshTokenRepository } from './jwt/refreshToken/refreshToken.repository'

import { AuthCredentialsDto } from '../dto/auth-credentials.dto'
import { JwtPairDto } from '../dto/jwt-pair.dto'

import { JwtPayload } from './jwt/jwt-payload.interface'
import { DeleteUserDto } from '../dto/admin.user-delete.dto'
import { EditUserDto } from '../dto/admin.user-edit.dto'
import { GetUserDto } from '../dto/admin.user-get'
import { User } from './user/user.entity'
import { AddClientDto } from '../dto/admin.client-add.dto'
import { GetClientsDto } from '../dto/admin.client-getClients'

/*
  Авторизация, операции с пользователямиs
*/

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(RefreshTokenRepository)
    private refreshTokenRepository: RefreshTokenRepository,
    private jwtService: JwtService
  ) {}

  /*
    Метод для добавления клиента без регистрации
    На данный момент клиент получает только fullName и роль client

    В случае успеха возвращает нового клиента
    Если клиент уже существует выбросит Unauthorized исключение
  */

  async addClient(addClientDto: AddClientDto) {
    return await this.userRepository.addClient(addClientDto)
  }

  /*
    Метод для редактирования пользователя
    Параметры которые необходимо отредактировать указываются в dto
    В случае успеха возвращает отредактированного пользователя
  */

  async editUser(editUserDto: EditUserDto): Promise<User> {
    return await this.userRepository.editUser(editUserDto)
  }

  /*
    Получение информации о конкретном пользователе
    dto указывает какую именно инфу нужно достать

    Изначально возвращает только id-шник
  */

  async getUser(getUserDto: GetUserDto) {
    let user = await this.userRepository.getUser(getUserDto)

    if (!user) {
      throw new NotFoundException(`User with id ${getUserDto.userID} not found`)
    }

    return user
  }

  /*
    Получение всех клиентов
    dto указывает какую именно инфу нужно достать

    Изначально возвращает только id-шники
  */

  async getClients(getClientsDto: GetClientsDto) {
    return await this.userRepository.getClients(getClientsDto)
  }

  /*
    Метод для удаления пользователя
    В случае успеха возвращает удалённого пользователя

    В случае если пользователь не будет найден 
    DeleteUser выбросит исключение

    Так-же метод удаляет рефреш токены пренадлежавшие пользователю
  */

  async deleteUser(deleteUserDto: DeleteUserDto): Promise<User> {
    return await this.userRepository.deleteUser(deleteUserDto)
  }

  /* 
    Регистрация пользователя
  */
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.signUp(authCredentialsDto)
  }

  /*
    Авторизация пользователя
    Возвращает пару новых access+refresh токенов при успехе
    В ином случае - UnathorizedException
  */

  async signIn(authCredentialsDto: AuthCredentialsDto): Promise<JwtPairDto> {
    /*
      Сюда падает null, в случае если валидация пользователя не происходит
    */
    const user = await this.userRepository.validateUserPassword(
      authCredentialsDto
    )

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const payload: JwtPayload = this.providePayload(user)
    const accessToken = await this.jwtService.sign(payload)
    const refreshToken = await this.refreshTokenRepository.generateRefreshToken(
      accessToken,
      user
    )

    return { accessToken, refreshToken }
  }

  /* 
     Метод для обновления пары access+refresh токенов

     В случае неудачи выпадает UnauthorizedException

     В случае успеха выдаст новую пару access+refresh токенов, если:
     Refresh токен совпадает с имеющимся в базе, и был выдан вместе с access токеном который метод получает на вход

     По факту в бд хранится хеш access+refresh токенов
     Соль, которой происходило хеширование, выдаётся юзеру в виде refresh токена
     
     Метод же хеширует пару access_token + соль (refreshToken), и затем ищет получившийся хеш в бд
     Если хеш не будет найден - у юзера либо невалидный refresh token
     Либо невалидный access token, который выдавался не вместе с имеющимся refresh token

     Так-же зашивает в Access новый payload, через метод providePayload
     
    */
  async refreshToken(
    oldAccessToken: string,
    oldRefreshToken: string
  ): Promise<JwtPairDto> {
    const refreshTokenHash = await bcrypt.hash(
      oldAccessToken.split('.')[2] + oldRefreshToken,
      oldRefreshToken
    )
    const refreshTokenDB = await this.refreshTokenRepository.findOne({
      hash: refreshTokenHash
    })

    if (!refreshTokenDB) {
      throw new UnauthorizedException(`Invalid tokens`)
    }

    const payload: JwtPayload = this.providePayload(refreshTokenDB.user)

    const newAccessToken = await this.jwtService.sign(payload)
    const salt = await bcrypt.genSalt(10)

    refreshTokenDB.hash = await bcrypt.hash(
      newAccessToken.split('.')[2] + salt,
      salt
    )

    try {
      await refreshTokenDB.save()
      return { accessToken: newAccessToken, refreshToken: salt }
    } catch (e) {
      throw new InternalServerErrorException()
    }
  }

  /*
    Метод для создания payload-а
  */

  providePayload(user: User): JwtPayload {
    let payload: JwtPayload = {
      userID: user.id,
      fullName: user.fullName,
      role: user.role
    }

    return payload
  }
}
