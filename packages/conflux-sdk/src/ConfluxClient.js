import { Conflux, util } from 'js-conflux-sdk'

export default class ConfluxClient {
  constructor(nodeUrl) {
    this.cfx = new Conflux({
      url: nodeUrl,
      defaultGasPrice: 100, // The default gas price of your following transactions
      defaultGas: 1000000, // The default gas of your following transactions
      logger: console,
    })
  }

  async transfer () {
    const tx = {
      from,
      to,
      value: util.unit.fromCFXToDrip(0.125),
      chainId: 0,
    }
    const txHash = await this.cfx.sendTransaction(tx)
    console.log(txHash)
    return txHash
  }
}