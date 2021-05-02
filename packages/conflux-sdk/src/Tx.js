import utils from './utils'

class Tx {
  constructor (cfx, tx) {
    this.cfx = cfx
    this.tx = tx
  }

  get from () {
    return this.tx.from
  }

  send (sp) {
    const account = this.cfx.wallet.addExternalAccount(this.from, sp)
    const pendingTx = this.sendTx(account)
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
