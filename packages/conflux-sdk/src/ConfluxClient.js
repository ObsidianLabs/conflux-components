import { Conflux, util } from 'js-conflux-sdk'

export default class ConfluxClient {
  constructor (nodeUrl, chainId) {
    this.cfx = new Conflux({
      url: nodeUrl,
      defaultGasPrice: 100, // The default gas price of your following transactions
      defaultGas: 1000000, // The default gas of your following transactions
      logger: console,
    })
  }
}