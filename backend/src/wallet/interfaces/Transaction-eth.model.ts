import { Timestamp } from 'typeorm'

export interface TransactionEthModel {
  type: boolean
  hash: string
  from: string
  to: string
  value: number
  time: Date
}
