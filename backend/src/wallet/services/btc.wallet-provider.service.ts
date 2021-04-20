import {
  HttpService,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { WalletBtcModel } from '../entities/Wallet-btc.model'
import { NumToBtc } from '../../helpers/NumToBtc'
import { TransactionBtcModel } from '../entities/Transaction-btc.model'

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

  /*
    Получение со стороннего api кошелька и его транзакций в виде WalletBtcModel

    Получает кошель и транзакции
    Преобразует кошель в WalletBtcModel
    И его транзакции в TransactionBtcModel

    Транзакции возвращаются отфильтрованные по времени в asc порядке
    Где в самом начале - старые, в конце - новые
  */

  async getBtcWallet(address: string): Promise<WalletBtcModel> {
    const { wallet, fetchedTransactions } = await this.getWallet(address)

    wallet.transactions = this.transformTransactions(
      fetchedTransactions,
      wallet.address
    )

    wallet.transactions.reverse()

    return wallet
  }

  /*
    Получение кошеля и транзакций со стороннего api
    Возвращает сырыми последние 30 транзакций в desc порядке
    Преобразует кошель в модель

    Если кошель не будет найден выбросит 404
  */

  private async getWallet(address: string) {
    let result
    try {
      result = await this.httpService
        .get(
          `https://api.smartbit.com.au/v1/blockchain/address/${address}?limit=30&dir=desc`
        )
        .toPromise()
    } catch (e) {
      this.logger.error(`Cannot add btc wallet with address ${address}`)
      throw new NotFoundException(`Wallet with address ${address} not found`)
    }

    const wallet: WalletBtcModel = {
      balance: NumToBtc(result.data.address.total.balance_int),
      address,
      transactions: []
    }

    return {
      wallet,
      fetchedTransactions: result.data.address.transactions
    }
  }

  /*
    Преобразование транзакций в TransactionBtcModel
    Производит необходимые вычисления чтобы привести сырые транзакции в человеческий вид
    И возвращает их в виде массива

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

  private transformTransactions(
    rawTransactions: any,
    walletAddress: string
  ): TransactionBtcModel[] {
    let transactions

    transactions = rawTransactions.map(transaction => {
      let inputSumm: number = 0
      let outputSumm: number = 0
      let transactionType: boolean
      let inputAdresses: string[] = []
      let outputAdresses: string[] = []

      if (transaction.inputs) {
        transaction.inputs.forEach(inputTsx => {
          inputTsx.addresses.forEach(address => {
            if (address == walletAddress) {
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

      if (summ > 0) {
        transactionType = true
        to = walletAddress
        from = inputAdresses[0] ? inputAdresses[0] : 'Newly Generated Coins'
      } else {
        transactionType = false
        from = walletAddress
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
    })

    return transactions
  }
}
