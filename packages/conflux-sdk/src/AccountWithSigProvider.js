import { Account } from 'js-conflux-sdk'
export default class AccountWithSigProvider extends Account {
  constructor (address, signatureProvider) {
    this.privateKey = ''
    this.publicKey = ''
    this.address = address
    this.sp = signatureProvider(address)
  }

  encrypt () {
    throw new Error('Unsupported method for AccountWithSigProvider')
  }

  signTransaction(options) {
    const tx = new Transaction(options)
    if (tx.from !== this.address) {
      throw new Error(`Invalid signature, transaction.from !== ${this.address}`)
    }
    return this.sp(tx)
  }

  signMessage(message) {
    const msg = new Message(message)
    if (msg.from !== this.address) {
      throw new Error(`Invalid signature, message.from !== ${this.address}`)
    }
    return this.sp(msg)
  }
}