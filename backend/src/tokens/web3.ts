import * as Web3 from 'web3'

let infuraWssUrl =
  'wss://ropsten.infura.io/ws/v3/28b42a756903430db51aed449ff78ad6'
let infuraHttpUrl =
  'https://ropsten.infura.io/v3/28b42a756903430db51aed449ff78ad6'

export const web3http = new Web3.default(infuraHttpUrl)
