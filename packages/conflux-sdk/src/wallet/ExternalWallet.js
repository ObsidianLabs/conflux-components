import { Wallet } from 'js-conflux-sdk'
import ExternalAccount from './ExternalAccount'

export default class ExternalWallet extends Wallet {
  addExternalAccount (address, sp) {
    if (!this.networkId) {
      console.warn('wallet.addExternalAccount: networkId is not set properly, please set it')
    }
    const account = new ExternalAccount(address, this.networkId, sp)
    this.set(account.address, account)
    return account
  }
}
