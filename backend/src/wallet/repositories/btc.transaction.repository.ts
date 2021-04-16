import { Logger } from '@nestjs/common'
import { EntityRepository, In, Repository } from 'typeorm'
import { TransactionBtcModel } from '../entities/Transaction-btc.model'
import { WalletBTC } from '../entities/Wallet-btc.entity'
import { TransactionBTC } from '../entities/Transaction-btc.entity'

@EntityRepository(TransactionBTC)
export class BtcTransactionRepository extends Repository<TransactionBTC> {
  private readonly logger = new Logger(BtcTransactionRepository.name)

  async addTransactions(
    wallet: WalletBTC,
    transactions: TransactionBtcModel[]
  ) {
    let walletTransactions = await wallet.transactions

    transactions.forEach(async element => {
      let transaction = this.create()
      transaction.hash = element.hash
      transaction.time = element.time
      transaction.type = element.type
      transaction.from = element.from
      transaction.to = element.to
      transaction.value = element.value

      walletTransactions.push(transaction)
    })

    return await wallet.save()
  }
  /*
    TODO
    Реализовать адекватный запрос
  */

  async getTransactionsByIds(ids: Number[]) {
    const results = await this.find({
      where: { wallet: { id: In(ids) } },
      order: { time: 'ASC' },
      loadEagerRelations: false
    })

    return results
  }
}
