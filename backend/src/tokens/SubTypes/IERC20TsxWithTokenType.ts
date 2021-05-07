export interface IERC20TsxWithTokenType {
    id: number
    type: boolean
    hash: string
    from: string
    to: string
    time: Date
    value: string
    token_symbol: string
    token_name: string
    chain?: string
}
