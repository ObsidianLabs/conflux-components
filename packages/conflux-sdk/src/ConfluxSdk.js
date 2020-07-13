import { IpcChannel } from '@obsidians/ipc'

import parseUrl from 'url-parse'
import { Account, util } from 'js-conflux-sdk'

import ConfluxClient from './ConfluxClient'
import signatureProvider from './signatureProvider'

export default class ConfluxSdk {
  constructor ({ url }) {
    this.client = new ConfluxClient(url)
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
    const balance = await this.client.cfx.getBalance(address)
    const code = await this.client.cfx.getCode(address)
    return {
      address,
      balance: util.unit.fromDripToCFX(balance),
      code
    }
  }

  async getAssetInfo (assetId) {
    if (!this.assets[assetId]) {
      this.assets[assetId] = await this.client.assetInformation(assetId)
    }
    return this.assets[assetId]
  }

  async getTransactions (address, page = 1) {
    const ipc = new IpcChannel()
    const result = await ipc.invoke('fetch', `https://testnet.confluxscan.io/api/transaction/list?accountAddress=${address}&page=${page}&pageSize=10&txType=all`)
    const json = JSON.parse(result)
    return json.result
  }

  async deploy (contractJson, fromAddress) {
    const from = new Account(fromAddress, signatureProvider)
    const contract = this.client.cfx.Contract(contractJson)
    const estimate = await contract.constructor().estimateGasAndCollateral({ from })
    const receipt = await contract.constructor()
      .sendTransaction({ from, gas: estimate.gasUsed, chainId: 0 })
      .executed()
    return receipt
  }

  contractFrom (abi, address) {
    return this.client.cfx.Contract({ abi, address })
  }

  async contract (abi, method, ...args) {
    const result = await contract[method](...args)
    return result.toString()
  }
}
