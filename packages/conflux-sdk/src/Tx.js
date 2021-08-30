import utils from './utils'

class Tx {
  constructor (cfx, tx) {
    this.cfx = cfx
    this.tx = tx
    this._sendThroughBrowserExtension = this.cfx._decoratePendingTransaction(this._sendThroughBrowserExtension)
  }

  get from () {
    return this.tx.from
  }

  send (sp, browserExtension) {
    let pendingTx
    if (browserExtension) {
      pendingTx = this._sendThroughBrowserExtension(browserExtension)
    } else {
      const account = this.cfx.wallet.addExternalAccount(this.from, sp)
      pendingTx = this.sendTx(account)
    }
    return this._processPendingTx(pendingTx)
  }

  _sendThroughBrowserExtension (browserExtension) {
    const txObject = { ...this.tx, ...this.override }
    txObject.gas = txObject.gas && `0x${BigInt(txObject.gas).toString(16)}`
    txObject.gasPrice = txObject.gasPrice && `0x${BigInt(txObject.gasPrice).toString(16)}`
    txObject.storageLimit = txObject.storageLimit && `0x${BigInt(txObject.storageLimit).toString(16)}`
    return new Promise((resolve, reject) => {
      browserExtension.sendTransaction(txObject, (err, result) => {
        err ? reject(err) : resolve(result.result)
      })
    })
  }

  _processPendingTx (pendingTx) {
    let tx
    return {
      then: (res, rej) => pendingTx.then(res, rej),
      mined: async () => {
        tx = await pendingTx.mined()
        return tx
      },
      executed: async () => {
        const receipt = await pendingTx.executed()
        if (receipt && receipt.outcomeStatus) {
          await pendingTx.cfx.call(tx, tx.epochHeight - 1).catch(err => {
            const decodedMessage = utils.decodeError(err.data.replace(/\"/g, ''))
            const e = new Error(decodedMessage)
            e.code = err.code
            e.data = err.data
            e.receipt = receipt
            throw e
          })
        }

        if (receipt.contractCreated) {
          receipt.contractCreated = receipt.contractCreated.replace('TYPE.CONTRACT:', '').toLowerCase()
        }
        return receipt
      },
      confirmed: () => pendingTx.confirmed(),
    }
  }
}

export class TransferTx extends Tx {
  sendTx (account) {
    return this.cfx.sendTransaction(this.tx)
  }

  async estimate ({ from }) {
    const account = await this.cfx.getAccount(from)
    return await this.cfx.estimateGasAndCollateral({ ...this.override, from, nonce: account.nonce })
  }
}

export class ContractTx extends Tx {
  constructor (cfx, tx, override) {
    super(cfx, tx)
    this.override = override
  }

  get from () {
    return this.override.from
  }

  sendTx (account) {
    return this.tx.sendTransaction({ ...this.override, from: account })
  }

  async estimate ({ from }) {
    const account = await this.cfx.getAccount(from)
    return await this.tx.estimateGasAndCollateral({ ...this.override, from, nonce: account.nonce })
  }
}
