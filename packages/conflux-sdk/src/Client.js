import { Conflux } from 'js-conflux-sdk'
import ExternalWallet from './wallet/ExternalWallet'

export default class Client {
  constructor (url, chainId) {
    this.cfx = new Conflux({
      url,
      defaultGasPrice: 100, // The default gas price of your following transactions
      defaultGas: 1000000, // The default gas of your following transactions
      // logger: console,
      useHexAddressInParameter: true,
      networkId: chainId
    })

    this.cfx.wallet = new ExternalWallet(chainId)
  }
}