import { ContractTx } from './Tx'

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
    return new ContractTx(this.cfx, tx, override)
  }

  async getLogs (event) {
    const status = await this.cfx.getStatus()
    const logs = await this.instance[event.name].call(...Array(event.inputs.length)).getLogs({
      fromEpoch: status.epochNumber - 9999 > 0 ? status.epochNumber - 9999 : 0,
      toEpoch: 'latest_state',
    })
    return logs.map(item => {
      item.blockNumber = item.epochNumber
      item.args = item.arguments
      return item
    })
  }
}