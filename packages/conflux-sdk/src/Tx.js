export default class Tx {
  constructor (tx, override) {
    this.tx = tx
    this.override = override
  }

  get from () {
    return this.override.from
  }

  send (signer) {
    return this.tx.sendTransaction({ ...this.override, from: signer })
  }

  async estimate ({ from }) {
    return await this.tx.estimateGasAndCollateral({ from })
  }
}