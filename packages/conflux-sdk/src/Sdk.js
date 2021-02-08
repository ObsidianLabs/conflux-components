import { IpcChannel } from '@obsidians/ipc'

import { Account, address as addressUtil } from 'js-conflux-sdk'

import Client from './Client'
import Contract from './Contract'
import Tx from './Tx'
import signatureProvider from './signatureProvider'
import util from './utils'

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
    // address can be hex40 or Conflux base32
    try {
      if (address.toUpperCase().startsWith('CFXTEST:') && this.chainId !== 1) {
        // Testnet
        return false
      } else if (address.toUpperCase().startsWith('CFX:') && this.chainId !== 1029) {
        // Mainnet
        return false
      }
      util.format.address(address, this.chainId)
      return true
    } catch(e) {
      return false
    }
  }

  convertAddress (address) {
    if (addressUtil.hasNetworkPrefix(address)) {
      return util.format.hexAddress(address)
    }
    return util.format.address(address, this.chainId, true)
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
    const hexAddress = util.format.hexAddress(address)
    const account = await this.client.cfx.getAccount(hexAddress)
    return {
      address: util.format.address(address, this.chainId, true).toUpperCase(),
      balance: util.unit.fromValue(account.balance),
      codeHash: account.codeHash,
    }
  }

  contractFrom ({ address, abi }) {
    return new Contract({ address, abi }, this.cfx)
  }

  async getTransferTransaction ({ from, to, amount }, override) {
    const value = util.unit.fromValue(amount)
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
    const hexAddress = util.format.hexAddress(address)
    const result = await ipc.invoke('fetch', `${this.explorer}/account/${hexAddress.toLowerCase()}`)
    const json = JSON.parse(result)
    return json.nonce
  }

  async getTransactions (address, page = 1, size = 10) {
    const ipc = new IpcChannel()
    if (!this.explorer) {
      return { noExplorer: true }
    }
    const hexAddress = util.format.hexAddress(address)
    const result = await ipc.invoke('fetch', `${this.explorer}/transaction?accountAddress=${hexAddress.toLowerCase()}&skip=${page * size}&limit=${size}`)
    const json = JSON.parse(result)
    if (!json.list) {
      return json
    }
    return {
      ...json,
      list: json.list.map(tx => ({
        ...tx,
        to: tx.to || tx.contractCreated,
        timeStamp: tx.timestamp,
        blockNumber: tx.epochNumber
      }))
    }
  }

  // contractFrom (options) {
  //   return this.client.cfx.Contract(options)
  // }

  async contract (abi, method, ...args) {
    const result = await contract[method](...args)
    return result.toString()
  }
}
