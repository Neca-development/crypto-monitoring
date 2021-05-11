export interface IERC20TranscationModel {
  type: boolean
  hash: string
  from: string
  to: string
  time: Date
  value: number
  fee: number
}
