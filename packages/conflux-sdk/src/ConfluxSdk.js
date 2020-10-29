import { IpcChannel } from '@obsidians/ipc'

import { util } from 'js-conflux-sdk'

import ConfluxClient from './ConfluxClient'

export default class ConfluxSdk {
  constructor ({ url, chainId, explorer, id }) {
    this.client = new ConfluxClient(url, chainId)
    this.url = url
    this.chainId = chainId
    this.explorer = explorer
    this.networkId = id
  }

  async getStatus () {
    return await this.client.cfx.getStatus()
  }

  isValidAddress (address) {
    try {
      util.format.address(address)
      return true
    } catch(e) {
      return false
    }
  }

  async accountFrom (address) {
    const account = await this.client.cfx.getAccount(address)
    return {
      address,
      balance: util.unit.fromDripToCFX(account.balance),
      codeHash: account.codeHash,
    }
  }

  async trend () {
    const ipc = new IpcChannel()
    const result = await ipc.invoke('fetch', `${this.explorer}/plot?interval=514&limit=7`)
    const json = JSON.parse(result)
    return json.list[json.total - 1]
  }

  async getTransactionsCount (address) {
    const ipc = new IpcChannel()
    if (!this.explorer) {
      return
    }
    const result = await ipc.invoke('fetch', `${this.explorer}/address/query?address=${address.toLowerCase()}`)
    const json = JSON.parse(result)
    return json.result.account.all
  }

  async getTransactions (address, page = 1, size = 10) {
    const ipc = new IpcChannel()
    if (!this.explorer) {
      return { noExplorer: true }
    }
    const result = await ipc.invoke('fetch', `${this.explorer}/transaction/list?accountAddress=${address.toLowerCase()}&page=${page}&pageSize=${size}&txType=all`)
    const json = JSON.parse(result)
    return json.result
  }

  contractFrom (options) {
    return this.client.cfx.Contract(options)
  }

  async contract (abi, method, ...args) {
    const result = await contract[method](...args)
    return result.toString()
  }
}
