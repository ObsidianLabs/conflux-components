import Tx from './Tx'

export default class Contract {
  constructor ({ address, abi }, cfx) {
    this.address = address
    this.abi = abi
    this.cfx = cfx
    this.instance = cfx.Contract({ address, abi })
  }

  async query (method, args) {
    return await this.instance[method].call(...args)
  }

  execute (method, args, override) {
    const tx = this.instance[method].call(...args)
    return new Tx(tx, override)
  }
}