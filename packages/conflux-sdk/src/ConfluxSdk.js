import { IpcChannel } from '@obsidians/ipc'

import { Account, util } from 'js-conflux-sdk'

import ConfluxClient from './ConfluxClient'
import signatureProvider from './signatureProvider'

export default class ConfluxSdk {
  constructor ({ url, chainId, explorer, id }) {
    this.client = new ConfluxClient(url, chainId)
    this.url = url
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

  async trend () {
    const ipc = new IpcChannel()
    const result = await ipc.invoke('fetch', `${this.explorer}/dashboard/trend?span=86400`)
    const json = JSON.parse(result)
    return json.result
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

  async deploy (contractJson, parameters) {
    const codeHash = util.sign.sha3(Buffer.from(contractJson.deployedBytecode.replace('0x', ''), 'hex')).toString('hex')

    const from = new Account(parameters.signer, signatureProvider)
    const contract = this.client.cfx.Contract(contractJson)
    // const estimate = await contract.constructor().estimateGasAndCollateral({ from })
    const receipt = await contract.constructor.call(...parameters.params)
      .sendTransaction({
        from,
        gas: parameters.gas, // estimate.gasUsed,
        gasPrice: parameters.gasPrice,
      })
      .executed()
    const tx = await this.client.cfx.getTransactionByHash(receipt.transactionHash)

    return {
      network: this.networkId,
      contractCreated: receipt.contractCreated,
      codeHash: `0x${codeHash}`,
      ...parameters,
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
