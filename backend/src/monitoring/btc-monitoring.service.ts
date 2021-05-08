import { HttpService, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NumToBtc } from 'src/helpers/NumToBtc'
import { TransactionBtcModel } from 'src/wallet/interfaces/Transaction-btc.model'
import { WalletBTC } from 'src/wallet/entities/Wallet-btc.entity'
import { BtcRepository } from 'src/wallet/repositories/btc.repository'
import { BtcTransactionRepository } from 'src/wallet/repositories/btc.transaction.repository'
import { EmailService } from '../email/email.service'
import Config from 'config'

let emailConfig: any = Config.get('email')

/*
  Мониторинг btc транзакций
  На данный момент сделано костылём для mvp 
  Для более надёжного мониторинга нужно поднимать ноду
*/

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

  /*
    Каждые N минут
    Сервис получает список btc кошельков из бд
    И запрашивает по каждому из них баланс и транзакции из стороннего pi

    Если баланс не сходится - запускается процесс обновления транзакций
  */

  async onModuleInit() {
    this.logger.log(`Btc Monitoring Service initalzied`)

    setInterval(async () => {
      let wallets = await this.btcRepository.getAllWallets()
      let requests = wallets.map(wallet => {
        return this.httpService
          .get(
            `https://api.smartbit.com.au/v1/blockchain/address/${wallet.address}?limit=5`
          )
          .toPromise()
      })

      let results: any = await Promise.all(requests)

      /*
        Логи оставлены поскольку бтс не до конца протестирован
      */

      for (let i = 0; i <= wallets.length - 1; i++) {
        if (wallets[i].balance != results[i].data.address.total.balance) {
          console.log('Balances are not the same')
          console.log(wallets[i].balance, results[i].data.address.total.balance)
          await this.updateTransactions(
            wallets[i],
            results[i].data.address.transactions,
            results[i].data.address.total.balance
          )
        } else {
          console.log(`Balance are the same`)
          console.log(wallets[i].balance, results[i].data.address.total.balance)
        }
      }
    }, 240000)
  }

  /*
    Обновление транзакций для кошелька

    В цикле сравнивает хеш последней имеющейся в бд транзакции с полученными
    Добавляет те транзакции хеш которых не совпадает с последним
    Если же хеш совпадает - цикл обрывается

    Так-же в конце обновляет баланс кошелька
  */

  async updateTransactions(
    wallet: WalletBTC,
    lastTransactions: any,
    balance: number
  ) {
    console.log(`Update transactions emitted`)
    const lastTsxHash = await this.btcTransactionRepositry.getLastTsxHash(
      wallet
    )

    console.log(`Last hash is`, lastTsxHash)

    let newTransactions: TransactionBtcModel[] = this.processLastTransactions(
      lastTransactions,
      wallet.address,
      lastTsxHash
    )

    /*
      Добавление транзакций к кошельку
    */

    newTransactions.reverse()

    console.log(`New transactions is`)
    console.log(newTransactions)

    await this.btcTransactionRepositry.addTransactionsByModel(
      wallet,
      newTransactions
    )

    console.log(`Balance is `, balance)

    wallet.balance = balance
    await wallet.save()

    this.sendNotifications(newTransactions, wallet)

    console.log(`New btc transactionы added`)
    console.log(`Wallet balance on end end is`, wallet.balance)
  }

  /*
    Метод для получения новых транзакций из списка последних транзакций
    Сравнивает последний хеш последней транзакции хранимой в бд
    С последними хешами последних переданных транзакциями (в desc порядке)
    В случае совпадения прерывает цикл
    В случае несовпадения производит все необходимые операции для формирования
    TransactionBtcModel

    Возвращает список новых транзакций в виде массива

    В кратце:
    Транзакция в сыром виде имеет инпуты и аутпуты
    Инпуты - исходящие операции
    Аутпуты - входящие

    Чтобы определить итоговый тип транзакции
    Нужно найти сумму value инпутов и аутпутов
    Затем вычесть из суммы аутпутов сумму инпутов
    
    Если полученное число положительное - транзакция входящая
    Получатель суммы - владелец кошелька
    Отправить - первый кошель из входящих транзакций

    Отрицательное - транзакция исходящая
    Отправитель суммы - владелец кошелька
    Получатель - первый кошель из исходящих транзакций
  */

  processLastTransactions(
    lastTransactions: any,
    walletAddress: string,
    lastTsxHash: string
  ): TransactionBtcModel[] {
    let newTransactions: TransactionBtcModel[] = []

    for (let i = 0; i <= lastTransactions.length - 1; i++) {
      let inputSumm: number = 0
      let outputSumm: number = 0
      let transactionType: boolean
      let inputAdresses: string[] = []
      let outputAdresses: string[] = []

      /* 
        Новые транзакции приходят в desc порядке по времени
        Если хеш последней транзакции в бд совпадает
        То все транзакции после будут старыми
        Поэтому цикл обрывается
      */

      if (lastTsxHash == lastTransactions[i].hash) {
        break
      }

      if (lastTransactions[i].inputs) {
        lastTransactions[i].inputs.forEach(inputTsx => {
          inputTsx.addresses.forEach(address => {
            if (address == walletAddress) {
              inputSumm += +inputTsx.value_int
            } else {
              inputAdresses.push(address)
            }
          })
        })
      }

      if (lastTransactions[i].outputs) {
        lastTransactions[i].outputs.forEach(outputTsx => {
          outputTsx.addresses.forEach(address => {
            if (address == walletAddress) {
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
        to = walletAddress
        from = inputAdresses[0] ? inputAdresses[0] : 'Newly Generated Coins'
      } else {
        transactionType = false
        from = walletAddress
        to = outputAdresses[0]
      }

      let time = lastTransactions[i].time
        ? new Date(lastTransactions[i].time * 1000)
        : new Date(lastTransactions[i].first_seen * 1000)

      let tsx: TransactionBtcModel = {
        value: NumToBtc(summ),
        hash: lastTransactions[i].hash,
        from,
        to,
        time,
        type: transactionType
      }

      newTransactions.push(tsx)
    }

    return newTransactions
  }

  /*
    Рассылка email уведомлений
  */

  private sendNotifications(
    transactions: TransactionBtcModel[],
    wallet: WalletBTC
  ) {
    transactions.forEach(transaction => {
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
  }
}
