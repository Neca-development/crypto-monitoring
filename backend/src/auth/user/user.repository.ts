import {
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UseFilters
} from '@nestjs/common'
import { EntityRepository, Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { AuthCredentialsDto } from '../../dto/auth-credentials.dto'
import { User } from './user.entity'
import { EditUserDto } from '../../dto/admin.user-edit.dto'
import { DeleteUserDto } from '../../dto/admin.user-delete.dto'
import { dbErrorCodes } from '../../config/db-error-codes'
import { GetUserDto } from '../../dto/admin.user-get'
import { AddClientDto } from '../../dto/admin.client-add.dto'
import { UserRole } from '../enum/user-role.enum'
import { GetClientsDto } from '../../dto/admin.client-getClients'
import config from 'config'
import { QueryFailedErrorFilter } from 'src/filters/Database.filter'

@EntityRepository(User)
@UseFilters(new QueryFailedErrorFilter())
export class UserRepository extends Repository<User> {
  private readonly logger = new Logger(UserRepository.name)

  //Создание админа по данным из конфига

  async onModuleInit() {
    const adminConfig: any = config.get('admin')

    if (adminConfig.email && adminConfig.password) {
      try {
        await this.signUp(
          {
            email: adminConfig.email,
            password: adminConfig.password
          },
          { role: UserRole.admin }
        )
      } catch (e) {}
    }
  }

  async getUserById(userID: number) {
    return await this.findOne({ id: userID })
  }

  async getUser(getUserDto: GetUserDto) {
    const { userID, fullName } = getUserDto

    let query = this.createQueryBuilder('user')
    query.where('user.id = :userID', { userID })
    query.select('user.id')

    if (fullName) {
      query.addSelect('user.fullName')
    }

    try {
      let user = await query.getOne()
      return user
    } catch (error) {
      this.logger.error(
        `Failed to get user. Filter: ${JSON.stringify(getUserDto)}`,
        error.stack
      )
      throw new InternalServerErrorException()
    }
  }

  async getClients(getClientsDto: GetClientsDto): Promise<User[]> {
    const { fullName } = getClientsDto

    const query = this.createQueryBuilder('user')
    query.select(['user.id'])
    query.where('user.role = :clientRole', { clientRole: UserRole.client })

    if (fullName) {
      query.addSelect('user.fullName')
    }

    try {
      const clients = await query.getMany()
      return clients
    } catch (error) {
      this.logger.error(
        `Failed to get clients. Filters: ${JSON.stringify(getClientsDto)}`,
        error.stack
      )
      throw new InternalServerErrorException()
    }
  }

  @UseFilters(new QueryFailedErrorFilter())
  async addClient(addClientDto: AddClientDto) {
    const { fullName } = addClientDto

    const user = this.create()
    user.fullName = fullName
    user.role = UserRole.client

    try {
      return await user.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        console.log(e)
        throw new ConflictException(
          `User with given credentials already exists`
        )
      } else {
        this.logger.error('Error with save operation: ', e)
        throw new InternalServerErrorException()
      }
    }
  }

  async deleteUser(deleteUserDto: DeleteUserDto) {
    const { id } = deleteUserDto
    let user: User = await this.findOne({ id })

    if (!user) {
      throw new NotFoundException(`User not found`)
    }

    try {
      return await user.remove()
    } catch (e) {
      this.logger.log(`Error with save method: `, e)
      throw new InternalServerErrorException()
    }
  }

  /*
    Регистрация нового пользователя
    При регистрации пароль хешируется bcrypt-ом, и записывается в user-а, вместе с солью
    В случае если email уже используется - метод выбросит ConflictException
  */

  async signUp(
    authCredentialsDto: AuthCredentialsDto,
    options?: {
      role?: UserRole
    }
  ): Promise<void> {
    const { email, password } = authCredentialsDto

    const user = this.create()
    user.email = email
    await this.setUserPassword(user, password)

    if (options && options.role) {
      user.role = options.role
    } else {
      user.role = UserRole.client
    }

    try {
      await user.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        //duplicate username
        throw new ConflictException(
          `User with given credentials already exists`
        )
      } else {
        this.logger.error('Error with save operation: ', e)
        throw new InternalServerErrorException()
      }
    }
  }

  /* 
    Валидация пароля пользователя
    В случае несовпадения или ненахода пользователя метод выплёвывает null
  */
  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto
  ): Promise<User> {
    const { email, password } = authCredentialsDto

    const user = await this.findOne({ email })

    if (user && (await user.validatePassword(password))) {
      return user
    } else {
      return null
    }
  }

  async editUser(editUserDto: EditUserDto): Promise<User> {
    const { newPassword, newFullName, newEmail, userID } = editUserDto

    let user = await this.getUserById(userID)

    if (!user) {
      throw new NotFoundException(`User with id ${userID} not found`)
    }

    if (newFullName) {
      user.fullName = newFullName
    }

    if (newEmail) {
      user.email = newEmail
    }

    if (newPassword) {
      await this.setUserPassword(user, newPassword)
    }

    try {
      return await user.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        //duplicate
        throw new ConflictException(
          `User with given credentials already exists`
        )
      } else {
        this.logger.error('Internal error: ', e)
        throw new InternalServerErrorException()
      }
    }
  }

  /*
    Метод для установки пользователя
    Скрывает детали хеширования пароля
  */

  async setUserPassword(user: User, password: string) {
    user.salt = await bcrypt.genSalt()
    user.password = await this.hashPassword(password, user.salt)
    return user
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt)
  }
}
