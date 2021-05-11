import * as Web3 from 'web3'

let infuraWssUrl: string
let infuraHttpUrl: string

if (process.env.NODE_ENV == 'production') {
  infuraWssUrl = 'wss://mainnet.infura.io/ws/v3/28b42a756903430db51aed449ff78ad6'
  infuraHttpUrl = 'https://mainnet.infura.io/v3/28b42a756903430db51aed449ff78ad6'
} else {
  infuraWssUrl = 'wss://ropsten.infura.io/ws/v3/28b42a756903430db51aed449ff78ad6'
  infuraHttpUrl = 'https://ropsten.infura.io/v3/28b42a756903430db51aed449ff78ad6'
}

export const web3http = new Web3.default(infuraHttpUrl)
export const web3wss = new Web3.default(infuraWssUrl)
