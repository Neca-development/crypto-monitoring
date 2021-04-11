import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
  ValidationPipe
} from '@nestjs/common'
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport'

import { AuthService } from './auth.service'

import { AuthCredentialsDto } from '../dto/auth-credentials.dto'
import { JwtPairDto } from '../dto/jwt-pair.dto'
import { DeleteUserDto } from '../dto/admin.user-delete.dto'
import { EditUserDto } from '../dto/admin.user-edit.dto'
import { GetUserDto } from '../dto/admin.user-get'
import { AddClientDto } from '../dto/admin.client-add.dto'
import { RolesGuard } from './guards/guards/roles.guard'
import { Roles } from './guards/guards/roles.decorator'
import { UserRole } from './enum/user-role.enum'
import { GetClientsDto } from '../dto/admin.client-getClients'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/admin/clients')
  @Roles(UserRole.admin)
  @UseGuards(AuthGuard(), RolesGuard)
  getClients(@Body(ValidationPipe) getClientsDto: GetClientsDto) {
    return this.authService.getClients(getClientsDto)
  }

  @Get('/admin/client')
  @Roles(UserRole.admin)
  @UseGuards(AuthGuard(), RolesGuard)
  getClient(
    @Body(new ValidationPipe({ transform: true })) getUserDto: GetUserDto
  ) {
    return this.authService.getUser(getUserDto)
  }

  @Post('/admin/client')
  @Roles(UserRole.admin)
  @UseGuards(AuthGuard(), RolesGuard)
  addClient(@Body(ValidationPipe) addClientDto: AddClientDto) {
    return this.authService.addClient(addClientDto)
  }

  @Delete('/admin/client')
  @Roles(UserRole.admin)
  @UseGuards(AuthGuard(), RolesGuard)
  deleteUser(@Body(ValidationPipe) deleteUserDto: DeleteUserDto) {
    return this.authService.deleteUser(deleteUserDto)
  }

  @Patch('/admin/client')
  @Roles(UserRole.admin)
  @UseGuards(AuthGuard(), RolesGuard)
  updateUser(@Body(ValidationPipe) editUserDto: EditUserDto) {
    return this.authService.editUser(editUserDto)
  }

  /*
    Регистрация пользователя
  */
  // @Post('/signup')
  // signUp(
  //   @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto
  // ): Promise<void> {
  //   return this.authService.signUp(authCredentialsDto)
  // }

  /*
    Логин, получение пары refresh+access токенов
  */
  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto
  ): Promise<JwtPairDto> {
    return this.authService.signIn(authCredentialsDto)
  }

  /*
     Обновление refresh токена
  */
  @Post('/refresh')
  refreshToken(
    @Body(ValidationPipe) JwtPairDto: JwtPairDto
  ): Promise<JwtPairDto> {
    return this.authService.refreshToken(
      JwtPairDto.accessToken,
      JwtPairDto.refreshToken
    )
  }

  /*
    Тест на владение актуальным access токеном
  */
  @Post('/test')
  @UseGuards(AuthGuard())
  test() {
    return {
      status: 'JWT token accepted'
    }
  }

  /*
    Тест на владение актуальным access токеном с ролью админа
  */

  @Post('admin/test')
  @Roles(UserRole.admin)
  @UseGuards(AuthGuard(), RolesGuard)
  testAdmin() {
    return {
      status: 'Admin jwt token accepted'
    }
  }
}
