import { IpcChannel } from '@obsidians/ipc'

import { address as addressUtil, Drip } from 'js-conflux-sdk'

import utils from './utils'
import Client from './Client'
import Contract from './Contract'
import { TransferTx, ContractTx } from './Tx'
import signatureProvider from './signatureProvider'
import BrowserExtension from './BrowserExtension'

export default class ConfluxSdk {
  constructor ({ url, chainId, explorer, id, version }) {
    this.client = new Client(url, chainId, version)
    this.url = url
    if (chainId) {
      this.chainId = chainId
    } else {
      this.cfx.updateNetworkId().then(() => {
        this.chainId = this.cfx.networkId
      })
    }
    this.explorer = explorer
    this.networkId = id
  }

  static InitBrowserExtension (networkManager) {
    if (window.conflux && window.conflux.isConfluxPortal) {
      return new BrowserExtension(networkManager, window.conflux)
    }
  }

  get cfx () {
    return this.client.cfx
  }

  isValidAddress (address) {
    // address can be hex40 or Conflux base32
    try {
      if (address.toLowerCase().startsWith('cfxtest:') && this.chainId !== 1) {
        // Testnet
        return false
      } else if (address.toLowerCase().startsWith('cfx:') && this.chainId !== 1029) {
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

  async latest () {
    const status = await this.cfx.getStatus()
    return status.latestState
  }

  async accountFrom (address) {
    const hexAddress = utils.format.hexAddress(address)
    const account = await this.client.cfx.getAccount(hexAddress)
    return {
      address: utils.format.address(address, this.chainId, true).toLowerCase(),
      balance: utils.unit.fromValue(account.balance),
      codeHash: account.codeHash,
    }
  }

  contractFrom ({ address, abi }) {
    return new Contract({ address, abi }, this.cfx)
  }

  async getTransferTransaction ({ from, to, amount }, override) {
    const value = Drip.fromCFX(amount)
    return new TransferTx(this.cfx, { from, to, value, ...override })
  }

  async getDeployTransaction ({ abi, bytecode, parameters }, override) {
    const factory = this.cfx.Contract({ abi, bytecode })
    const tx = factory.constructor.call(...parameters)
    return new ContractTx(this.cfx, tx, override)
  }

  async estimate (tx) {
    const result = await tx.estimate({ from: tx.from })
    const gas = result.gasUsed && result.gasUsed.toString() || ''
    const storageLimit = result.storageCollateralized && result.storageCollateralized.toString() || ''
    return { gas, storageLimit }
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
        blockNumber: tx.epochNumber,
      }))
    }
  }
}
