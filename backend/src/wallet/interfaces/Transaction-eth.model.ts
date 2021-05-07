export interface TransactionEthModel {
  type: boolean
  hash: string
  from: string
  to: string
  time: Date
  value: number
  fee: number
}
