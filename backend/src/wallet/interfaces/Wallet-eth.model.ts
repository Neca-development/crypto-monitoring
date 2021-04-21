import { TransactionEthModel } from './Transaction-eth.model'

export interface WalletEthModel {
  balance: number
  address: string
  transactions: TransactionEthModel[]
}
