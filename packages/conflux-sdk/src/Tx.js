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
    return await this.cfx.estimateGasAndCollateral({ ...this.override, from })
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

  send (sp) {
    const account = this.cfx.wallet.addExternalAccount(this.from, sp)
    return this.tx.sendTransaction({ ...this.override, from: account })
  }

  async estimate ({ from }) {
    return await this.tx.estimateGasAndCollateral({ ...this.override, from })
  }
}