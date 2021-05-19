import { ContractTx } from './Tx'

export default class Contract {
  constructor ({ address, abi }, cfx) {
    this.address = address
    this.abi = abi
    this.cfx = cfx
    this.instance = cfx.Contract({ address, abi })
  }

  async query (method, { array }) {
    return await this.instance[method].call(...array)
  }

  execute (method, { array }, override) {
    const tx = this.instance[method].call(...array)
    return new ContractTx(this.cfx, tx, override)
  }

  async getLogs (event, maxGap = 1000) {
    const status = await this.cfx.getStatus()
    const logs = await this.instance[event.name]
      .call(...new Array(event.inputs.length).fill(null))
      .getLogs({
        fromEpoch: status.epochNumber - maxGap > 0 ? status.epochNumber - maxGap : 0,
        toEpoch: 'latest_state',
      })
    return logs.map(item => {
      item.blockNumber = item.epochNumber
      item.args = item.arguments
      return item
    })
  }
}