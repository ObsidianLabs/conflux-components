import { IpcChannel } from '@obsidians/ipc'

import { address as addressUtil, Drip, format } from 'js-conflux-sdk'

import Client from './Client'
import Contract from './Contract'
import { TransferTx, ContractTx } from './Tx'
import signatureProvider from './signatureProvider'
import utils from './utils'

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
      utils.format.address(address, this.chainId)
      return true
    } catch(e) {
      return false
    }
  }

  convertAddress (address) {
    if (addressUtil.hasNetworkPrefix(address)) {
      return utils.format.hexAddress(address)
    }
    return utils.format.address(address, this.chainId, true)
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
    const hexAddress = utils.format.hexAddress(address)
    const account = await this.client.cfx.getAccount(hexAddress)
    return {
      address: utils.format.address(address, this.chainId, true).toUpperCase(),
      balance: utils.unit.fromValue(account.balance),
      codeHash: account.codeHash,
    }
  }

  contractFrom ({ address, abi }) {
    return new Contract({ address, abi }, this.cfx)
  }

  async getTransferTransaction ({ from, to, amount }, override) {
    const hexFrom = utils.format.hexAddress(from)
    const value = Drip.fromCFX(amount)
    return new TransferTx(this.cfx, { from: hexFrom, to, value, ...override })
  }

  async getDeployTransaction ({ abi, bytecode, parameters }, override) {
    const factory = this.cfx.Contract({ abi, bytecode })
    const tx = factory.constructor.call(...parameters)
    return new ContractTx(this.cfx, tx, override)
  }

  async estimate (tx) {
    const result = await tx.estimate({ from: tx.from })
    const gas = result.gasUsed && result.gasUsed.toString() || ''
    const storage = result.storageCollateralized && result.storageCollateralized.toString() || ''
    return { gas, storage }
  }

  sendTransaction (tx) {
    const sp = signatureProvider(tx.from)
    return tx.send(sp)
  }

  async getTransactionsCount (address) {
    const ipc = new IpcChannel()
    if (!this.explorer) {
      return
    }
    const hexAddress = utils.format.hexAddress(address)
    const result = await ipc.invoke('fetch', `${this.explorer}/account/${hexAddress.toLowerCase()}`)
    const json = JSON.parse(result)
    return json.nonce
  }

  async getTransactions (address, page = 1, size = 10) {
    const ipc = new IpcChannel()
    if (!this.explorer) {
      return { noExplorer: true }
    }
    const hexAddress = utils.format.hexAddress(address)
    const result = await ipc.invoke('fetch', `${this.explorer}/transaction?accountAddress=${hexAddress.toLowerCase()}&skip=${page * size}&limit=${size}`)
    const json = JSON.parse(result)
    if (!json.list) {
      return json
    }
    return {
      ...json,
      list: json.list.map(tx => ({
        ...tx,
        from: tx.from.replace('TYPE.USER:', '').toLowerCase(),
        to: tx.to && tx.to.replace('TYPE.USER:', '').replace('TYPE.CONTRACT:', '').toLowerCase(),
        contractAddress: tx.contractCreated && tx.contractCreated.replace('TYPE.CONTRACT:', '').toLowerCase(),
        timeStamp: tx.timestamp,
        blockNumber: tx.epochNumber
      }))
    }
  }
}
