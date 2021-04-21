import {
  ConflictException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { EntityRepository, In, Repository } from 'typeorm'
import { TransactionETH } from '../entities/Transaction-eth.entity'
import { TransactionEthModel } from '../interfaces/Transaction-eth.model'
import { WalletETH } from '../entities/Wallet-eth.entity'
import { NumToEth } from '../../helpers/NumToEth'
import { dbErrorCodes } from 'src/config/db-error-codes'

@EntityRepository(TransactionETH)
export class EthTransactionRepository extends Repository<TransactionETH> {
  private readonly logger = new Logger(EthTransactionRepository.name)

  /*
    Добавление новых транзакций к кошельку по модели
    В случае если транзакция с переданым хешем уже существует выбросит conflict
  */

  async addTransactionsByModel(
    wallet: WalletETH,
    transactions: TransactionEthModel[]
  ): Promise<WalletETH> {
    let walletTransactions = await wallet.transactions

    transactions.forEach(async element => {
      let transaction = this.create()
      transaction.hash = element.hash
      transaction.time = element.time
      transaction.type = element.type
      transaction.from = element.from
      transaction.to = element.to
      transaction.value = NumToEth(element.value)

      walletTransactions.push(transaction)
    })

    try {
      return await wallet.save()
    } catch (e) {
      if (e.code === dbErrorCodes.duplicate) {
        this.logger.error(`Duplicate transactions found`, e.stack)
        this.logger.error(walletTransactions)
        throw new ConflictException(`Duplicate transacions found`)
      }
      this.logger.error(`Cannot add transactions to db`, e.stack)
      this.logger.error(walletTransactions)
      throw new InternalServerErrorException('Cannot add transactions')
    }
  }

  /*
    Получение хеша последней транзакции по кошельку
  */

  async getLastTsxHash(wallet: WalletETH): Promise<string> {
    let transactions = await wallet.transactions

    if (!transactions.length) {
      return 'No transactions found'
    }

    return transactions[transactions.length - 1].hash
  }

  /*
    Получение транзакций по айдишникам кошельков
    Так-же происходит сортировка по времени ASC
  */

  async getTransactionsByWalletIds(ids: Number[]): Promise<TransactionETH[]> {
    const results = await this.find({
      where: { wallet: { id: In(ids) } },
      order: { time: 'ASC' },
      loadEagerRelations: false
    })

    return results
  }
}
