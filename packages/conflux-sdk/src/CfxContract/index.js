import { ContractTx } from '../CfxTxManager/Tx'
import utils from '../utils'

export default class CfxContract {
  constructor ({ address, abi }, client) {
    this.address = address
    this.abi = abi
    this.client = client
    this.instance = this.client.cfx.Contract({ address, abi:[abi] })
  }

  get chainId () {
    return this.client.chainId
  }

  async query (method, { array }) {
    let result
    try {
      result = await this.instance[method].call(...array)
    } catch (e) {
      throw utils.parseError(e)
    }
    return this.parseResult(result, method)
  }

  execute (method, { array }, override) {
    const tx = this.instance[method].call(...array)
    const getResult = async transaction => {
      const result = await tx.call(transaction, transaction.epochHeight - 1)
      return this.parseResult(result, method)
    }
    return new ContractTx(this.client, tx, getResult, override)
  }

  parseResult (result, method) {
    const methodAbi = this.abi.find(item => item.name === method)
    const abi = methodAbi && methodAbi.outputs
    const parsed = utils.parseObject(abi.length === 1 ? [result] : result, abi, this.chainId)
    return {
      raw: result,
      parsed: Object.values(parsed),
    }
  }

  get maxGap () {
    return this.chainId === 1029 ? 100 : 1000
  }

  async getLogs (event, { from, to } = {}) {
    const logs = await this.instance[event.name]
      .call(...new Array(event.inputs.length).fill(null))
      .getLogs({ fromEpoch: from, toEpoch: to })
    return logs.map(item => {
      item.blockNumber = item.epochNumber
      item.args = item.arguments
      return item
    })
  }
}