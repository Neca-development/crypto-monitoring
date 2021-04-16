import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  ValidationPipe
} from '@nestjs/common'
import { GetWalletDto } from '../dto/admin.get-wallet.dto'
import { AddWalletDto } from '../dto/admin.add-wallet.dto'
import { DeleteWalletDto } from '../dto/admin.delete-wallet.dto'
import { GetWalletsStats } from '../dto/admin.get-wallets-stats.dto'
import { WalletService } from './wallet.service'
import { GetUserWalletsInfo } from '../dto/admin.wallets-user-info.dto'

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  getWallet(@Body(ValidationPipe) getWalletDto: GetWalletDto) {
    return this.walletService.getWallet(getWalletDto)
  }

  @Get('/user')
  userWalletsInfo(@Body(ValidationPipe) userWalletsInfo: GetUserWalletsInfo) {
    return this.walletService.userWalletsInfo(userWalletsInfo)
  }

  @Get('/users')
  getUsersWallets() {
    return this.walletService.getUsersWallets()
  }

  @Get('/stats')
  getStats(@Body(ValidationPipe) getWalletsStatsDto: GetWalletsStats) {
    return this.walletService.getWalletsStats(getWalletsStatsDto)
  }

  @Post()
  addWallet(@Body(ValidationPipe) addWalletDto: AddWalletDto) {
    return this.walletService.addWallet(addWalletDto)
  }

  @Delete()
  deleteWallet(@Body(ValidationPipe) deleteWalletDto: DeleteWalletDto) {
    return this.walletService.deleteWallet(deleteWalletDto)
  }
}
