import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/auth/user/user.entity'
import { UserRepository } from 'src/auth/user/user.repository'
import { AddWalletDto } from './dto/admin.add-wallet.dto'
import { WalletType } from './enum/WalletType.enum'
import { BtcService } from './services/btc.service'
import { EthService } from './services/eth.service'

@Injectable()
export class WalletService {
  constructor(
    private BtcService: BtcService,
    private EthService: EthService,
    @InjectRepository(UserRepository)
    private userRepository: UserRepository
  ) {}

  async addWallet(addWalletDto: AddWalletDto) {
    const { userID, address, type } = addWalletDto
    const user: User = await this.userRepository.getUserById(userID)

    if (!user) {
      throw new NotFoundException(`User with id ${userID} not found`)
    }

    switch (type) {
      case WalletType.btc:
        return await this.BtcService.addWallet(user, address)
      case WalletType.eth:
        return await this.EthService.addWallet(user, address)

      default:
        throw new BadRequestException(`Invalid wallet type ${type}`)
    }
  }
}
