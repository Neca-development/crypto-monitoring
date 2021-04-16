import { Logger } from '@nestjs/common'
import { EntityRepository, In, Repository } from 'typeorm'
import { TransactionETH } from '../entities/Transaction-eth.entity'
import { TransactionEthModel } from '../entities/Transaction-eth.model'
import { WalletETH } from '../entities/Wallet-eth.entity'
import { NumToEth } from '../../helpers/NumToEth'

@EntityRepository(TransactionETH)
export class EthTransactionRepository extends Repository<TransactionETH> {
  private readonly logger = new Logger(EthTransactionRepository.name)

  async addTransactions(
    wallet: WalletETH,
    transactions: TransactionEthModel[]
  ) {
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

    return await wallet.save()
  }

  async getLastTsxHash(wallet: WalletETH) {
    let transactions = await wallet.transactions

    if (!transactions.length) {
      return 'No transactions found'
    }

    return transactions[transactions.length - 1].hash
  }

  async getTransactionsByWalletIds(ids: Number[]) {
    const results = await this.find({
      where: { wallet: { id: In(ids) } },
      order: { time: 'ASC' },
      loadEagerRelations: false
    })

    return results
  }
}
