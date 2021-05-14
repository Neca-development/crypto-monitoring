import { HttpService, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EmailService } from 'src/email/email.service'
import { TransactionEthModel } from 'src/wallet/interfaces/Transaction-eth.model'
import { WalletETH } from 'src/wallet/entities/Wallet-eth.entity'
import { EthRepository } from 'src/wallet/repositories/eth.repository'
import { EthTransactionRepository } from 'src/wallet/repositories/eth.transaction.repository'
import * as Web3 from 'web3'
import Config from 'config'
import { NumToEth } from 'src/helpers/NumToEth'
import { web3http } from '../helpers/web3'

let emailConfig: any = Config.get('email')

/*
  Мониторинг eth транзакций
  На данный момент сделан костылём ради mvp, с использованием нескольких сторонных api
  Поскольку на адекватную реализацю нужно поднимать ноду
*/

@Injectable()
export class EthMonitoringService {
  private etherscanApiKey = 'Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV'

  private logger = new Logger(EthMonitoringService.name)

  constructor(
    @InjectRepository(EthRepository) private ethRepository: EthRepository,
    @InjectRepository(EthTransactionRepository)
    private ethTransactionRepository: EthTransactionRepository,
    private httpService: HttpService,
    private emailService: EmailService
  ) {}

  /*
    Каждые N минут
    Сервис получает список eth кошельков из бд
    И запрашивает по каждому из них баланс из web3

    Если баланс не сходится - запускается процесс обновления транзакций
  */

  async onModuleInit() {
    setInterval(async () => {
      let wallets = await this.ethRepository.getAllWallets()
      let requests = wallets.map(wallet => {
        return web3http.eth.getBalance(wallet.address)
      })
      let web3balances = await Promise.all(requests)

      for (let i = 0; i <= wallets.length - 1; i++) {
        if (wallets[i].balance != NumToEth(parseInt(web3balances[i]))) {
          console.log('Balances are not the same')
          console.log(wallets[i].balance, NumToEth(parseInt(web3balances[i])))

          /*
            Опытным путём было выяснено что транзакции в api etherscan появляется не сразу
            Посему поставлена задержка
          */
          setTimeout(async () => {
            await this.updateTransactions(wallets[i], parseInt(web3balances[i]))
          }, 10000)
        } else {
          console.log(`Balances are the same`)
          console.log(wallets[i].balance, web3balances[i])
        }
      }
    }, 240000)
  }

  /*
    Обновление транзакций для кошелька
    Метод запрашивает 5 последних транзакций по кошельку из api
    И в цикле сравнивает хеш последней имеющейся в бд транзакции с полученными
    Добавляет те транзакции хеш которых не совпадает с последним
    Если же хеш совпадает - цикл обрывается

    Так-же в конце обновляет баланс кошелька
  */

  private async updateTransactions(wallet: WalletETH, balance: number) {
    // Получаем список последних транзакций со стороннего api
    let lastTransactions = await this.getLastTransactions(wallet.address)
    // Получаем последний хеш имеющейся в бд транзакции
    let lastTsxHash = await this.ethTransactionRepository.getLastTsxHash(wallet)

    let newTransactions: TransactionEthModel[] = []

    /*
      Цикл для сравнения новых транзакций и хеша последней имеющейся в бд транзакции
    */

    for (let i = 0; i <= lastTransactions.length - 1; i++) {
      /* 
        Новые транзакции приходят в desc порядке по времени
        Если хеш последней транзакции в бд совпадает
        То все транзакции после будут старыми
        Поэтому цикл обрывается
      */
      if (lastTsxHash == lastTransactions[i].hash) {
        break
      }

      /*
        Транзакции без value игнорируются
      */

      if (NumToEth(lastTransactions[i].value) == 0) {
        continue
      }

      let model = this.convertToModel(lastTransactions[i], wallet.address)
      newTransactions.push(model)
    }

    console.log(`New transactions is`)
    console.log(newTransactions)

    /*
      Добавление преобразованных в модель транзакций в бд
      Reverse для порядка asc
    */

    newTransactions.reverse()

    let result = await this.ethTransactionRepository.addTransactionsByModel(
      wallet,
      newTransactions
    )

    this

    /*
      Сохранение нового баланса кошелька
    */

    wallet.balance = NumToEth(balance)
    await wallet.save()

    /*
      Рассылка оповещений о балансах
    */

    console.log(`Wallet balance on end end is`, wallet.balance)

    this.logger.log(`Transactions added`)
  }

  /*
    Конвертация сырой транзакции в модель
  */

  sendNotifications(transactions: TransactionEthModel[], wallet: WalletETH) {
    transactions.forEach(transaction => {
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
  }

  convertToModel(transaction: any, address: string): TransactionEthModel {
    let type = transaction.to == address.toLowerCase() ? true : false
    let tsx: TransactionEthModel = {
      type,
      time: new Date(transaction.timeStamp * 1000),
      from: transaction.from,
      to: transaction.to,
      hash: transaction.hash,
      value: +transaction.value,
      fee: NumToEth(+transaction.gasPrice) * +transaction.gasUsed
    }

    return tsx
  }

  /*
    Получение последних 5 транзакци по кошельку со стороннего api
  */

  async getLastTransactions(address: string) {
    // Test https://api-ropsten.etherscan.io/api?module=account&action=txlist&sort=desc&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&apikey=XV7IHEB5WHVI9XKTMHUMW9YYQ4RBTUEFZ5
    // Official https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.etherscanApiKey}&offset=5&page=1
    let response = await this.httpService
      .get(
        `https://api.etherscan.io/api?module=account&action=txlist&sort=desc&address=${address}&startblock=0&endblock=99999999&page=1&offset=5&apikey=${this.etherscanApiKey}`,
        {}
      )
      .toPromise()

    return response.data.result
  }
}
