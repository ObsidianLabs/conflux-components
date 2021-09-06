import { Conflux } from 'js-conflux-sdk'
import semver from 'semver'

import platform from '@obsidians/platform'
import { IpcChannel } from '@obsidians/ipc'
import redux from '@obsidians/redux'

import utils from '../utils'
import ExternalWallet from './wallet/ExternalWallet'

export default class CfxClient {
  constructor (option) {
    const { networkId, chainId, explorer, version = '1.1.1' } = option
    
    let url = option.url
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url
    }

    this.networkId = networkId
    this.url = url
    this.explorer = explorer

    this.cfx = new Conflux({
      url,
      defaultGasPrice: 100,
      defaultGas: 1000000,
      useHexAddressInParameter: semver.lt(version, '1.1.1'),
      networkId: chainId
    })

    this.prepare(chainId).then(() => {
      this.cfx.wallet = new ExternalWallet(this.chainId)
    })

    if (platform.isDesktop) {
      this.channel = new IpcChannel('sdk')
      this.channel.invoke('setNetwork', option)
    } else {
      this.channel = new IpcChannel()
    }
  }

  async prepare (chainId) {
    if (chainId) {
      this.chainId = chainId
    } else {
      await this.cfx.updateNetworkId()
      this.chainId = this.cfx.networkId
    }
  }

  dispose () {
    if (platform.isDesktop) {
      this.channel.invoke('unsetNetwork')
    }
  }

  async networkInfo () {
    if (this.explorer) {
      const result = await this.channel.invoke('fetch', `${this.explorer}/plot?interval=514&limit=7`)
      const json = JSON.parse(result)
      return json.list[json.total - 1]
    } else {
      return await this.getStatus()
    }
  }

  async getStatus () {
    return await this.cfx.getStatus()
  }

  async latest () {
    const status = await this.getStatus()
    return status.latestState
  }

  async getAccount (address) {
    const account = await this.cfx.getAccount(address)
    return {
      address: utils.formatAddress(address, this.chainId),
      balance: utils.unit.fromValue(account.balance),
      nonce: account.nonce.toString(),
      codeHash: account.codeHash === '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470' ? null : account.codeHash,
    }
  }

  async getTransactions (address, page = 1, size = 10) {
    const hexAddress = utils.format.hexAddress(address)

    if (this.networkId.startsWith('dev')) {
      const { queue } = redux.getState()
      const txs = queue.getIn([this.networkId, 'txs'])
      if (!txs) {
        return { length: 0, list: [] }
      }

      const filtered = txs.filter(tx => {
        let from = tx.getIn(['data', 'transaction', 'from'])
        from = from ? utils.format.hexAddress(from) : ''
        let to = tx.getIn(['data', 'transaction', 'to'])
        to = to ? utils.format.hexAddress(to) : ''
        return tx.get('status') === 'CONFIRMED' &&
          (hexAddress === from || hexAddress === to)
      })

      const list = filtered.map(tx => {
        const transaction = tx.getIn(['data', 'transaction']).toJS()
        const receipt = tx.getIn(['data', 'receipt']).toJS()
        transaction.from = utils.formatAddress(transaction.from, this.chainId)
        transaction.to = utils.formatAddress(transaction.to, this.chainId)
        receipt.from = utils.formatAddress(receipt.from, this.chainId)
        receipt.to = utils.formatAddress(receipt.to, this.chainId)
        receipt.blockNumber = receipt.epochNumber
        return {
          ...transaction,
          ...receipt,
          contractAddress: utils.formatAddress(receipt.contractCreated, this.chainId),
          timeStamp: tx.get('ts'),
          method: tx.getIn(['data', 'functionName']),
        }
      }).toArray()

      return { length: list.length, list }
    }

    if (!this.explorer) {
      return { noExplorer: true }
    }

    const result = await this.channel.invoke('fetch', `${this.explorer}/transaction?accountAddress=${hexAddress.toLowerCase()}&skip=${page * size}&limit=${size}`)
    const json = JSON.parse(result)
    if (!json.list) {
      return json
    }
    return {
      ...json,
      list: json.list.map(tx => ({
        ...tx,
        from: utils.formatAddress(tx.from, this.chainId),
        to: utils.formatAddress(tx.to, this.chainId),
        contractAddress: utils.formatAddress(tx.contractCreated, this.chainId),
        method: tx.method === '0x' ? undefined : tx.method,
        timeStamp: tx.timestamp,
        blockNumber: tx.epochNumber,
        gasUsed: (BigInt(tx.gasFee) / BigInt(tx.gasPrice)).toString(),
      }))
    }
  }

  async getTokens (address) {
    if (!this.explorer) {
      return
    }
    const result = await this.channel.invoke('fetch', `${this.explorer}/token?accountAddress=${address}&fields=icon`)
    const json = JSON.parse(result)
    if (!json.list) {
      return []
    }
    return json.list.map(token => ({
      ...token,
      type: token.transferType,
      accountAddress: utils.formatAddress(token.address, this.chainId),
      address: utils.formatAddress(token.address, this.chainId),
    }))
  }

  async getTokenInfo (address) {
    if (!this.explorer) {
      return
    }
    const result = await this.channel.invoke('fetch', `${this.explorer}/token/${address}?fields=name&fields=icon`)
    const json = JSON.parse(result)
    if (json) {
      json.type = json.transferType
    }
    return json
  }

  async callRpc (method, params) {
    return await this.cfx.provider.call(method, ...params)
  }
}