import { ERC20TokenType } from '../entities/ERC20-token-type.entity'
import { IERC20TranscationModel } from './IERC20Transaction'

export interface IERC20TokenModel {
  balance: number
  type: ERC20TokenType
  transactions: IERC20TranscationModel[]
}
