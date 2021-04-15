import { Body, Controller, Post, ValidationPipe } from '@nestjs/common'
import { AddWalletDto } from './dto/admin.add-wallet.dto'
import { WalletService } from './wallet.service'

@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Post()
  addWallet(@Body(ValidationPipe) addWalletDto: AddWalletDto) {
    return this.walletService.addWallet(addWalletDto)
  }
}
