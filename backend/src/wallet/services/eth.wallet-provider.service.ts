import {
  BadRequestException,
  HttpService,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { NumToEth } from 'src/helpers/NumToEth'
import * as Web3 from 'web3'
import { TransactionEthModel } from '../interfaces/Transaction-eth.model'
import { WalletEthModel } from '../interfaces/Wallet-eth.model'

/*
  Mainnet infura
  http: https://mainnet.infura.io/v3/28b42a756903430db51aed449ff78ad6
  ws: wss://mainnet.infura.io/ws/v3/28b42a756903430db51aed449ff78ad6

  Test:
  http: https://ropsten.infura.io/v3/43adaa094d794787ba472b1e7d7e00c6
  wss: wss://ropsten.infura.io/ws/v3/43adaa094d794787ba472b1e7d7e00c6
*/

/*
  Сервис отвечающий добавление кошелька
  Связывается со сторонними api чтобы получить данные о криптовых кошельках
*/

@Injectable()
export class EthWalletProviderService {
  constructor(private httpService: HttpService) { }

  private readonly logger = new Logger(EthWalletProviderService.name)

  private infuraUrl =
    'https://mainnet.infura.io/v3/28b42a756903430db51aed449ff78ad6'

  private infuraTestUrl =
    'https://ropsten.infura.io/v3/43adaa094d794787ba472b1e7d7e00c6'

  private etherscanApiKey = 'Q4ZAGAHGFQBPKTKRJTDZDPZXFAUGJ1VRRV'

  private web3 = new Web3.default(this.infuraTestUrl)

  /*
    Получение со стороннего api кошелька и его транзакций в виде WalletEthModel

    Получает кошель и транзакции
    Преобразует кошель в WalletEthModel
    И его транзакции в TransactionEthModel

    Транзакции возвращаются отфильтрованные по времени в asc порядке
    Где в самом начале - старые, в конце - новые
  */

  async getEthWallet(address: string): Promise<WalletEthModel> {
    let balance = await this.getBalance(address)

    let wallet: WalletEthModel = {
      balance,
      address,
      transactions: []
    }

    let transactions = await this.getTransactions(address)

    wallet.transactions = this.transformTransactions(transactions, address)

    wallet.transactions.reverse()

    return wallet
  }

  /*
    Получение баланса кошеля
    Выбросит NotFoundException если кошель не будет найден
  */

  private async getBalance(address: string): Promise<number> {
    let balance
    try {
      balance = await this.web3.eth.getBalance(address)
      this.logger.log(`Balance is ${balance}`)
    } catch (e) {
      this.logger.error(`Cannot get wallet with address ${address}`, e.stack)
      throw new NotFoundException(`Wallet with address ${address} not found`)
    }

    return +balance
  }

  // Mainnet url https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${this.etherscanApiKey}&offset=30&page=1
  // Test url https://api-ropsten.etherscan.io/api?module=account&action=txlist&sort=desc&address=${address}&startblock=0&endblock=99999999&page=1&offset=30&apikey=XV7IHEB5WHVI9XKTMHUMW9YYQ4RBTUEFZ5
  // Сортировка Asc - айдишники идут последовательно, самая старая операция - самый большой id

  /*
    Получение списка транзакций по кошельку
    Возвращает массив транзакций в сыром виде
    В desc сортировке
  */
  private async getTransactions(address: string) {
    let response
    try {
      response = await this.httpService
        .get(
          `https://api-ropsten.etherscan.io/api?module=account&action=txlist&sort=desc&address=${address}&startblock=0&endblock=99999999&page=1&offset=30&apikey=XV7IHEB5WHVI9XKTMHUMW9YYQ4RBTUEFZ5`,
          {}
        )
        .toPromise()
    } catch (e) {
      this.logger.error(
        `Cannot get transactions from etherscan for address ${address}`,
        e.stack,
        JSON.stringify(response.data)
      )

      throw new InternalServerErrorException(
        `Cannot get transactions from etherscan for address ${address}`
      )
    }

    return response.data.result
  }

  /*
    Трансформация сырых транзакций в TransactionEthModel[]
    Возвращает массив транзакций в desc ортировке
  */

  private transformTransactions(
    rawTransactions: any,
    address: string
  ): TransactionEthModel[] {
    let transactions: TransactionEthModel[] = []

    rawTransactions.forEach(tsx => {
      if (tsx.value == 0) {
        return
      }

      console.group(`Tsx is`)
      console.log(tsx)
      let type = tsx.to == address.toLowerCase() ? true : false
      let transaction: TransactionEthModel = {
        type,
        time: new Date(tsx.timeStamp * 1000),
        from: tsx.from,
        to: tsx.to,
        hash: tsx.hash,
        value: +tsx.value,
        fee: NumToEth(+tsx.gasPrice) * +tsx.gasUsed
      }

      transactions.push(transaction)
    })

    return transactions
  }
}
