class Tx {
  constructor (cfx, tx) {
    this.cfx = cfx
    this.tx = tx
  }

  get from () {
    return this.tx.from
  }
}

export class TransferTx extends Tx {
  send (sp) {
    this.cfx.wallet.addExternalAccount(this.from, sp)
    return this.cfx.sendTransaction(this.tx)
  }

  async estimate ({ from }) {
    return await this.cfx.estimateGasAndCollateral({ from })
  }
}

export class ContractTx extends Tx {
  send (sp) {
    const account = this.cfx.wallet.addExternalAccount(this.from, sp)
    return this.tx.sendTransaction({ from: account })
  }

  async estimate ({ from }) {
    return await this.tx.estimateGasAndCollateral({ from })
  }
}