export default class Tx {
  constructor (cfx, tx) {
    this.cfx = cfx
    this.tx = tx
  }

  get from () {
    return this.tx.from
  }

  send (sp) {
    this.cfx.wallet.addExternalAccount(this.from, sp)
    return this.cfx.sendTransaction(this.tx)
  }

  async estimate ({ from }) {
    return await this.cfx.estimateGasAndCollateral({ from })
  }
}
