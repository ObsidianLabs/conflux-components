import { Conflux } from 'js-conflux-sdk'
import semver from 'semver'
import ExternalWallet from './wallet/ExternalWallet'

export default class Client {
  constructor (url, chainId, version = '1.1.1') {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url
    }
    this.cfx = new Conflux({
      url,
      defaultGasPrice: 100, // The default gas price of your following transactions
      defaultGas: 1000000, // The default gas of your following transactions
      // logger: console,
      useHexAddressInParameter: semver.lt(version, '1.1.1'),
      networkId: chainId
    })

    this.cfx.wallet = new ExternalWallet(chainId)
  }
}