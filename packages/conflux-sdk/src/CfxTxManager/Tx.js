import utils from '../utils'

class Tx {
  constructor (client, tx, getResult) {
    this.client = client
    this.tx = tx
    this.getResult = getResult
    this._sendThroughBrowserExtension = this.client.cfx._decoratePendingTransaction(this._sendThroughBrowserExtension)
  }

  get from () {
    return this.tx.from
  }

  get chainId () {
    return this.client.chainId
  }

  send (sp, browserExtension) {
    let pendingTx
    if (browserExtension) {
      pendingTx = this._sendThroughBrowserExtension(browserExtension)
    } else {
      const account = this.client.cfx.wallet.addExternalAccount(this.from, sp)
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
    let transaction
    return {
      then: (res, rej) => pendingTx.then(res, rej),
      mined: async () => {
        const res = {}

        transaction = await pendingTx.mined()
        transaction.value = transaction.value.toString()
        transaction.nonce = transaction.nonce.toString()
        transaction.gas = transaction.gas.toString()
        transaction.gasPrice = transaction.gasPrice.toString()
        transaction.storageLimit = transaction.storageLimit.toString()

        if (this.getResult) {
          try {
            res.result = await this.getResult(transaction)
          } catch (e) {
            res.error = e.message
          }
        }
        res.transaction = transaction
        return res
      },
      executed: async () => {
        let receipt
        try {
          receipt = await pendingTx.executed()
        } catch (e) {
          await this.call(transaction)
        }

        if (receipt.contractCreated) {
          receipt.contractCreated = utils.formatAddress(receipt.contractCreated, this.chainId)
        }

        receipt.gasFee = receipt.gasFee.toString()
        receipt.gasUsed = receipt.gasUsed.toString()
        receipt.storageCollateralized = receipt.storageCollateralized.toString()
        return receipt
      },
      confirmed: () => pendingTx.confirmed(),
    }
  }

  async call (transaction) {
    return await this.client.cfx.call(transaction, transaction.epochHeight - 1)
  }
}

export class TransferTx extends Tx {
  sendTx (account) {
    return this.client.cfx.sendTransaction(this.tx)
  }

  async estimate ({ from }) {
    const account = await this.client.getAccount(from)
    return await this.client.cfx.estimateGasAndCollateral({ ...this.override, from, nonce: account.nonce })
  }
}

export class ContractTx extends Tx {
  constructor (client, tx, getResult, override) {
    super(client, tx, getResult)
    this.override = override
  }

  get from () {
    return this.override.from
  }

  sendTx (account) {
    return this.tx.sendTransaction({ ...this.override, from: account })
  }

  async estimate ({ from }) {
    const account = await this.client.getAccount(from)
    return await this.tx.estimateGasAndCollateral({ ...this.override, from, nonce: account.nonce })
  }
}
