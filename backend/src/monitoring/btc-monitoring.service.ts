import { HttpService, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NumToBtc } from 'src/helpers/NumToBtc'
import { TransactionBtcModel } from 'src/wallet/entities/Transaction-btc.model'
import { WalletBTC } from 'src/wallet/entities/Wallet-btc.entity'
import { BtcRepository } from 'src/wallet/repositories/btc.repository'
import { BtcTransactionRepository } from 'src/wallet/repositories/btc.transaction.repository'
import { EmailService } from '../email/email.service'
import Config from 'config'

// 'wss://ws.smartbit.com.au/v1/blockchain?type=new-transaction'
// wss://socket.blockcypher.com/v1/btc/main?token=

let emailConfig: any = Config.get('email')

@Injectable()
export class BtcMonitoringService {
  private readonly logger = new Logger(BtcMonitoringService.name)

  constructor(
    private httpService: HttpService,
    @InjectRepository(BtcRepository) private btcRepository: BtcRepository,
    @InjectRepository(BtcTransactionRepository)
    private btcTransactionRepositry: BtcTransactionRepository,
    private emailService: EmailService
  ) {}
  // async onModuleInit() {
  //   this.logger.log(`Btc Monitoring Service initalzied`)

  //   setInterval(async () => {
  //     let wallets = await this.btcRepository.getAllWallets()
  //     let requests = wallets.map(wallet => {
  //       return this.httpService
  //         .get(
  //           `https://api.smartbit.com.au/v1/blockchain/address/${wallet.address}?limit=5`
  //         )
  //         .toPromise()
  //     })

  //     let results: any = await Promise.all(requests)

  //     for (let i = 0; i <= wallets.length - 1; i++) {
  //       if (wallets[i].balance == results[i].data.address.total.balance) {
  //         console.log(`Balance are the same`)
  //         console.log(wallets[i].balance, results[i].data.address.total.balance)
  //       } else {
  //         console.log('Balances are not the same')
  //         console.log(wallets[i].balance, results[i].data.address.total.balance)
  //         await this.updateTransactions(wallets[i], results[i].data.address)
  //       }
  //     }
  //   }, 60000)
  // }

  async updateTransactions(wallet: WalletBTC, lastTransactions: any) {
    console.log(`Update transactions emitted`)
    const lastTsxHash = await this.btcTransactionRepositry.getLastTsxHash(
      wallet
    )

    console.log(`Last hash is`, lastTsxHash)

    let newTransactions: TransactionBtcModel[] = []
    let newBalance = wallet.balance

    lastTransactions.map(transaction => {
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

      if (tsx.type == true) {
        newBalance += tsx.value
        console.log(`Model type is true`)
        console.log(`Model value is`, tsx.value)
        console.log(`newBalance`, newBalance)
      } else {
        newBalance -= tsx.value
        console.log(`Model type is false`)
        console.log(`newBalance`, newBalance)
      }
      newTransactions.push(tsx)

      return tsx
    })

    let result = await this.btcTransactionRepositry.addTransactions(
      wallet,
      newTransactions.reverse()
    )

    console.log(`NEW BTC TRANSACTION ADDED!!!!!`)
    // console.log(`Result is`)
    // console.log(result)

    console.log(`New balance on end is`, newBalance)

    wallet.balance = newBalance
    await wallet.save()

    newTransactions.forEach(transaction => {
      let type = transaction.type ? 'Incoming' : 'Outcoming'
      this.emailService.sendMail({
        to: emailConfig.receiver,
        subject: 'New transaction',
        text: `Name: ${wallet.user.fullName} \n Address: ${
          wallet.address
        } \n Type: ${type} \n Summ of transaction ${NumToBtc(
          transaction.value
        )} \n Block explorer: https://www.blockchain.com/btc/tx/${
          transaction.hash
        }`
      })
    })

    console.log(`Wallet balance on end end is`, wallet.balance)

    console.log(`Transactions added`)
  }
}