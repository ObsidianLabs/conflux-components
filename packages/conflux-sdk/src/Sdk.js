import { IpcChannel } from '@obsidians/ipc'

import { address as addressUtil, Drip } from 'js-conflux-sdk'

import utils from './utils'
import Client from './Client'
import rpc from './rpc'
import Contract from './Contract'
import { TransferTx, ContractTx } from './Tx'
import signatureProvider from './signatureProvider'
import BrowserExtension from './BrowserExtension'
import ERC20 from './redux/abi/ERC20.json'

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
      address: utils.format.address(address, this.chainId, true)
        .replace('TYPE.USER:', '')
        .replace('TYPE.CONTRACT:', '')
        .toLowerCase(),
      balance: utils.unit.fromValue(account.balance),
      txCount: BigInt(txCount).toString(10),
      codeHash: account.codeHash === '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' ? null : account.codeHash,
    }
  }

  contractFrom ({ address, abi }) {
    return new Contract({ address, abi }, this.cfx)
  }

  async getTransferTransaction ({ from, to, token, amount }, override) {
    if (token === 'core' || !token) {
      const value = utils.unit.toValue(amount)
      return new TransferTx(this.cfx, { from, to, value, ...override })
    } else {
      const value = utils.format.big(amount).times(10 ** token.decimals).toString()
      const contract = new Contract({ address: token.address, abi: ERC20 }, this.cfx)
      return contract.execute('transfer', { array: [to, value] }, { ...override, from })
    }
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

  sendTransaction (tx) {
    if (browserExtension && browserExtension.currentAccount === tx.from) {
      return tx.send(null, browserExtension)
    } else {
      const sp = signatureProvider(tx.from)
      return tx.send(sp)
    }
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
    if (!this.explorer) {
      return { noExplorer: true }
    }
    const ipc = new IpcChannel()
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
        method: tx.method === '0x' ? undefined : tx.method,
        timeStamp: tx.timestamp,
        blockNumber: tx.epochNumber,
        gasUsed: BigInt(tx.gasFee) / BigInt(tx.gasPrice),
      }))
    }
  }

  async tokenInfo (address) {
    if (!this.explorer) {
      return
    }
    const ipc = new IpcChannel()
    const result = await ipc.invoke('fetch', `${this.explorer}/token/${address}?fields=name&fields=icon`)
    const json = JSON.parse(result)
    if (json) {
      json.type = json.transferType
    }
    return json
  }

  async getTokens (address) {
    if (!this.explorer) {
      return
    }
    const ipc = new IpcChannel()
    const result = await ipc.invoke('fetch', `${this.explorer}/token?accountAddress=${address}&fields=icon`)
    const json = JSON.parse(result)
    if (!json.list) {
      return []
    }
    return json.list.map(token => ({
      ...token,
      accountAddress: token.address.replace('TYPE.USER:', '').toLowerCase(),
      address: token.address.replace('TYPE.CONTRACT:', '').toLowerCase(),
    }))
  }
}
