import {
  HttpService,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { WalletBtcModel } from '../entities/Wallet-btc.model'
import { NumToBtc } from '../../helpers/NumToBtc'
import { TransactionBtcModel } from '../entities/Transaction-btc.model'
import { SimpleConsoleLogger, TransactionRepository } from 'typeorm'

/*
    Mainnet infura
    http: https://mainnet.infura.io/v3/28b42a756903430db51aed449ff78ad6
    ws: wss://mainnet.infura.io/ws/v3/28b42a756903430db51aed449ff78ad6
  
    Test:
    http: https://ropsten.infura.io/v3/43adaa094d794787ba472b1e7d7e00c6
    wss: wss://ropsten.infura.io/ws/v3/43adaa094d794787ba472b1e7d7e00c6
  */

@Injectable()
export class BtcWalletProviderService {
  constructor(private httpService: HttpService) {}

  private readonly logger = new Logger(BtcWalletProviderService.name)

  async getBtcWallet(address: string): Promise<WalletBtcModel> {
    let walletResult: any

    try {
      walletResult = await this.httpService
        .get(
          `https://api.smartbit.com.au/v1/blockchain/address/${address}?limit=30&dir=desc`
        )
        .toPromise()
    } catch (e) {
      this.logger.error(`Cannot add btc wallet with address ${address}`)
      throw new NotFoundException(`Wallet with address ${address} not found`)
    }

    // console.log(`Wallet result`, walletResult.data.address.transactions)

    const wallet: WalletBtcModel = {
      balance: NumToBtc(walletResult.data.address.total.balance_int),
      address,
      transactions: []
    }

    wallet.transactions = walletResult.data.address.transactions.map(
      transaction => {
        let inputSumm: number = 0
        let outputSumm: number = 0
        let transactionType: boolean
        let inputAdresses: string[] = []
        let outputAdresses: string[] = []

        // console.log(`Tsx is`, transaction)

        // console.log(transaction)

        if (transaction.inputs) {
          transaction.inputs.forEach(inputTsx => {
            inputTsx.addresses.forEach(address => {
              if (address == wallet.address) {
                inputSumm += +inputTsx.value_int
              } else {
                inputAdresses.push(address)
              }
            })
          })
        }

        if (transaction.outputs) {
          transaction.outputs.forEach(outputTsx => {
            outputTsx.addresses.forEach(address => {
              if (address == wallet.address) {
                outputSumm += +outputTsx.value_int
              } else {
                outputAdresses.push(address)
              }
            })
          })
        }

        let summ = outputSumm - inputSumm
        let to: string
        let from: string

        // this.logger.log(`Output summ is ${outputSumm}`)
        // this.logger.log(`Input summ is ${inputSumm}`)
        // this.logger.log(`Summ is ${summ}`)

        if (summ > 0) {
          transactionType = true
          to = wallet.address
          from = inputAdresses[0] ? inputAdresses[0] : 'Newly Generated Coins'
        } else {
          transactionType = false
          from = wallet.address
          to = outputAdresses[0]
        }

        let time = transaction.time
          ? new Date(transaction.time * 1000)
          : new Date(transaction.first_seen * 1000)

        let tsx: TransactionBtcModel = {
          value: NumToBtc(summ),
          hash: transaction.hash,
          from,
          to,
          time,
          type: transactionType
        }

        return tsx
      }
    )

    wallet.transactions.reverse()

    return wallet
  }
}
