import { IpcChannel } from '@obsidians/ipc'

import { Account, util } from 'js-conflux-sdk'

import Client from './Client'
import Contract from './Contract'
import Tx from './Tx'
import signatureProvider from './signatureProvider'

export default class ConfluxSdk {
  constructor ({ url, chainId, explorer, id }) {
    this.client = new Client(url, chainId)
    this.url = url
    this.chainId = chainId
    this.explorer = explorer
    this.networkId = id
  }

  get cfx () {
    return this.client.cfx
  }

  isValidAddress (address) {
    try {
      util.format.address(address)
      return true
    } catch(e) {
      return false
    }
  }

  async networkInfo () {
    const ipc = new IpcChannel()
    const result = await ipc.invoke('fetch', `${this.explorer}/plot?interval=514&limit=7`)
    const json = JSON.parse(result)
    return json.list[json.total - 1]
  }

  async getStatus () {
    return await this.cfx.getStatus()
  }

  async accountFrom (address) {
    const account = await this.client.cfx.getAccount(address)
    return {
      address,
      balance: util.unit.fromDripToCFX(account.balance),
      codeHash: account.codeHash,
    }
  }

  contractFrom ({ address, abi }) {
    return new Contract({ address, abi }, this.cfx)
  }

  async getTransferTransaction ({ from, to, amount }, override) {
    const value = util.unit.fromCFXToDrip(amount)
    return new Tx(this.cfx, { from, to, value, ...override })
  }

  async getDeployTransaction ({ abi, bytecode, parameters }, override) {
    const factory = this.cfx.Contract({ abi, bytecode })
    const tx = factory.constructor.call(...parameters)
    return new Tx(tx, override)
  }

  async estimate (tx) {
    const result = await tx.estimate({ from: tx.from })
    const gas = result.gasUsed && result.gasUsed.toString() || ''
    const storage = result.storageCollateralized && result.storageCollateralized.toString() || ''
    return { gas, storage }
  }

  sendTransaction (tx) {
    const signer = new Account(tx.from, signatureProvider)
    return tx.send(signer)
  }

  async getTransactionsCount (address) {
    const ipc = new IpcChannel()
    if (!this.explorer) {
      return
    }
    const result = await ipc.invoke('fetch', `${this.explorer}/account/${address.toLowerCase()}`)
    const json = JSON.parse(result)
    return json.nonce
  }

  async getTransactions (address, page = 1, size = 10) {
    const ipc = new IpcChannel()
    if (!this.explorer) {
      return { noExplorer: true }
    }
    const result = await ipc.invoke('fetch', `${this.explorer}/transaction?accountAddress=${address.toLowerCase()}&skip=${page * size}&limit=${size}`)
    const json = JSON.parse(result)
    return json
  }

  // contractFrom (options) {
  //   return this.client.cfx.Contract(options)
  // }

  async contract (abi, method, ...args) {
    const result = await contract[method](...args)
    return result.toString()
  }
}
