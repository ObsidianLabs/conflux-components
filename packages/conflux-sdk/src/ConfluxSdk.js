import { IpcChannel } from '@obsidians/ipc'

import { Account, util } from 'js-conflux-sdk'

import ConfluxClient from './ConfluxClient'
import signatureProvider from './signatureProvider'

export default class ConfluxSdk {
  constructor ({ url, chainId, explorer, id }) {
    this.client = new ConfluxClient(url, chainId)
    this.chainId = chainId
    this.explorer = explorer
    this.networkId = id
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

  async getAssetInfo (assetId) {
    if (!this.assets[assetId]) {
      this.assets[assetId] = await this.client.assetInformation(assetId)
    }
    return this.assets[assetId]
  }

  async getTransactions (address, page = 1) {
    const ipc = new IpcChannel()
    const result = await ipc.invoke('fetch', `${this.explorer}/transaction/list?accountAddress=${address}&page=${page}&pageSize=10&txType=all`)
    const json = JSON.parse(result)
    return json.result
  }

  async deploy (contractJson, fromAddress) {
    const codeHash = util.sign.sha3(Buffer.from(contractJson.deployedBytecode.replace('0x', ''), 'hex')).toString('hex')

    const from = new Account(fromAddress, signatureProvider)
    const contract = this.client.cfx.Contract(contractJson)
    const estimate = await contract.constructor().estimateGasAndCollateral({ from })
    const receipt = await contract.constructor()
      .sendTransaction({ from, gas: estimate.gasUsed })
      .executed()
    const tx = await this.client.cfx.getTransactionByHash(receipt.transactionHash)

    return {
      network: this.networkId,
      contractCreated: receipt.contractCreated,
      codeHash: `0x${codeHash}`,
      tx,
      receipt,
    }
  }

  contractFrom (abi, address) {
    return this.client.cfx.Contract({ abi, address })
  }

  async contract (abi, method, ...args) {
    const result = await contract[method](...args)
    return result.toString()
  }
}
