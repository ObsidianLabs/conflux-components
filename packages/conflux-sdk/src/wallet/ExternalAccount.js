import { PrivateKeyAccount } from 'js-conflux-sdk'
import lodash from 'lodash'
import utils from '../utils'

function assert (bool, value) {
  if (!bool) {
    if (lodash.isPlainObject(value)) {
      value = JSON.stringify(value)
    }
    throw new Error(value)
  }
}

export default class ExternalAccount extends PrivateKeyAccount.__proto__ {
  constructor (address, networkId, sp) {
    super(address)

    this.networkId = networkId
    this.sp = sp
  }

  encrypt () {
    throw new Error('ExternalAccount.encrypt is not implemented.')
  }

  async signTransaction (options) {
    const transaction = await super.signTransaction(options)
    await this.sp(transaction, this.networkId)

    assert(transaction.from === this.address, {
      message: 'Invalid sign transaction.from',
      expected: this.address,
      got: transaction.from,
    })

    return transaction
  }

  async signMessage (options) {
    const message = await super.signMessage(options)
    await this.sp(message, this.networkId)

    assert(transaction.from === this.address, {
      message: 'Invalid sign message.from',
      expected: this.address,
      got: message.from,
    })

    return message
  }
}
