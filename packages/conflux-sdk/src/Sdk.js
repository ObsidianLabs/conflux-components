import { IpcChannel } from '@obsidians/ipc'

import { address as addressUtil, Drip } from 'js-conflux-sdk'

import utils from './utils'
import Client from './Client'
import rpc from './rpc'
import Contract from './Contract'
import { TransferTx, ContractTx } from './Tx'
import signatureProvider from './signatureProvider'
import BrowserExtension from './BrowserExtension'

let browserExtension

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
    this.sendThroughBrowserExtension = this.cfx._decoratePendingTransaction(this.sendThroughBrowserExtension)
  }

  static InitBrowserExtension (networkManager) {
    if (window.conflux && window.conflux.isConfluxPortal) {
      browserExtension = new BrowserExtension(networkManager, window.conflux)
      return browserExtension
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

  async callRpc (method, parameters) {
    const params = rpc.prepare(parameters)
    return await this.cfx.provider.call(method, ...params)
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
    const account = await this.cfx.getAccount(hexAddress)
    const txCount = this.explorer
      ? await this.getTransactionsCount(address)
      : await this.cfx.provider.call('cfx_getNextNonce', hexAddress)
    return {
      address: utils.format.address(address, this.chainId, true).toLowerCase(),
      balance: utils.unit.fromValue(account.balance),
      txCount: BigInt(txCount).toString(10),
      codeHash: account.codeHash,
    }
  }

  contractFrom ({ address, abi }) {
    return new Contract({ address, abi }, this.cfx)
  }

  async getTransferTransaction ({ from, to, amount }, override) {
    const value = utils.unit.toValue(amount)
    return new TransferTx(this.cfx, { from, to, value, ...override })
  }

  async getDeployTransaction ({ abi, bytecode, parameters }, override) {
    const factory = this.cfx.Contract({ abi, bytecode })
    const tx = factory.constructor.call(...parameters)
    return new ContractTx(this.cfx, tx, override)
  }

  async estimate (tx) {
    const result = await tx.estimate({ from: tx.from })
    const gasPrice = await this.callRpc('cfx_gasPrice')
    return {
      gas: result.gasLimit && result.gasLimit.toString() || '',
      gasPrice: BigInt(gasPrice).toString(10),
      storageLimit: result.storageCollateralized && result.storageCollateralized.toString() || ''
    }
  }

  async sendThroughBrowserExtension (tx) {
    return new Promise((resolve, reject) => {
      browserExtension.sendTransaction(tx, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result.result)
        }
      })
    }) 
  }

  sendTransaction (tx) {
    let pendingTx
    if (browserExtension && browserExtension.currentAccount === tx.from) {
      pendingTx = this.sendThroughBrowserExtension(tx.tx)
    } else {
      const sp = signatureProvider(tx.from)
      pendingTx = tx.send(sp)
    }
    return pendingTx
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
