import { TransactionBtcModel } from './Transaction-btc.model'

export interface WalletBtcModel {
  balance: number
  address: string
  transactions: TransactionBtcModel[]
}
