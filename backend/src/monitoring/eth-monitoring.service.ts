import { HttpService, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EmailService } from 'src/email/email.service'
import { TransactionEthModel } from 'src/wallet/entities/Transaction-eth.model'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'
import { EthRepository } from 'src/wallet/repositories/eth.repository'
import { EthTransactionRepository } from 'src/wallet/repositories/eth.transaction.repository'
import * as Web3 from 'web3'
import Config from 'config'
import { NumToEth } from 'src/helpers/NumToEth'

let emailConfig: any = Config.get('email')

@Injectable()
export class EthMonitoringService {
  private infuraUrl =
    'https://mainnet.infura.io/v3/28b42a756903430db51aed449ff78ad6'

  private infuraTestUrl =
    'https://ropsten.infura.io/v3/43adaa094d794787ba472b1e7d7e00c6'

  private etherscanApiKey = 'Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV'

  private web3 = new Web3.default(this.infuraUrl)

  constructor(
    @InjectRepository(EthRepository) private ethRepository: EthRepository,
    @InjectRepository(EthTransactionRepository)
    private ethTransactionRepository: EthTransactionRepository,
    private httpService: HttpService,
    private emailService: EmailService
  ) {}

  async onModuleInit() {
    setInterval(async () => {
      let wallets = await this.ethRepository.getAllWallets()
      let requests = wallets.map(wallet => {
        return this.web3.eth.getBalance(wallet.address)
      })
      let results = await Promise.all(requests)

      for (let i = 0; i <= wallets.length - 1; i++) {
        if (wallets[i].balance != NumToEth(parseInt(results[i]))) {
          console.log('Balances are not the same')
          console.log(wallets[i].balance, NumToEth(parseInt(results[i])))
          await this.updateTransactions(wallets[i], parseInt(results[i]))
        } else {
          console.log(`Balances are the same`)
          console.log(wallets[i].balance, results[i])
        }
      }
    }, 240000)
  }

  async updateTransactions(wallet: WalletETH, balance: number) {
    let lastTransactions = await this.getLastTransactions(wallet.address)
    let lastTsxHash = await this.ethTransactionRepository.getLastTsxHash(wallet)

    let newTransactions: TransactionEthModel[] = []

    for (let i = 0; i <= lastTransactions.length - 1; i++) {
      if (lastTsxHash == lastTransactions[i].hash) {
        break
      }

      if (NumToEth(lastTransactions[i].value) == 0) {
        continue
      }

      let model = this.convertToModel(lastTransactions[i], wallet.address)
      newTransactions.push(model)
    }

    console.log(`New transactions is`)
    console.log(newTransactions)

    let result = await this.ethTransactionRepository.addTransactionsByModel(
      wallet,
      newTransactions.reverse()
    )

    console.log(`NEW ETH TRANSACTION ADDED!!!!!`)

    wallet.balance = NumToEth(balance)
    await wallet.save()

    newTransactions.forEach(transaction => {
      let type = transaction.type ? 'Incoming' : 'Outcoming'
      this.emailService.sendMail({
        to: emailConfig.receiver,
        subject: 'New transaction',
        text: `Name: ${wallet.user.fullName} \n Address: ${
          wallet.address
        } \n Type: ${type} \n Summ of transaction ${NumToEth(
          transaction.value
        )} \n Block explorer: https://etherscan.io/tx/${transaction.hash}`
      })
    })

    console.log(`Wallet balance on end end is`, wallet.balance)

    console.log(`Transactions added`)
  }

  // TODO
  // Порядок
  // Value

  convertToModel(transaction: any, address: string) {
    let type = transaction.to == address.toLowerCase() ? true : false
    let tsx: TransactionEthModel = {
      type,
      time: new Date(transaction.timeStamp * 1000),
      from: transaction.from,
      to: transaction.to,
      hash: transaction.hash,
      value: +transaction.value
    }

    return tsx
  }

  async getLastTransactions(address: string) {
    // Test https://api-ropsten.etherscan.io/api?module=account&action=txlist&sort=desc&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&apikey=XV7IHEB5WHVI9XKTMHUMW9YYQ4RBTUEFZ5
    // Official https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.etherscanApiKey}&offset=5&page=1
    let response = await this.httpService
      .get(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.etherscanApiKey}&offset=5&page=1`,
        {}
      )
      .toPromise()

    return response.data.result
  }
}
