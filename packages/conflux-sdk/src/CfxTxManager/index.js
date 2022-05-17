import utils from '../utils'
import { TransferTx, ContractTx } from './Tx'

import signatureProvider from './signatureProvider'
import ERC20 from '../redux/abi/ERC20.json'

export default class CfxTxManager {
  constructor (client) {
    this.client = client
  }

  async getTransferTx (Contract, { from, to, token, amount }, override) {
    let overrideObj = Object.assign({}, override)
    const gas = await this.client.callRpc('cfx_gasPrice', [])
    delete overrideObj.gas
    delete overrideObj.gasPrice
    delete overrideObj.gasLimit
    overrideObj.gasPrice = gas
    if (token === 'core' || !token) {
      const value = utils.unit.toValue(amount)
      return new TransferTx(this.client, { from, to, value, ...overrideObj })
    } else {
      const value = utils.format.big(amount).times(utils.format.big(10).pow(token.decimals)).toString()
      const contract = new Contract({ address: token.address, abi: ERC20 }, this.client)
      return contract.execute('transfer', { array: [to, value] }, { ...overrideObj, from })
    }
  }

  async getDeployTx ({ abi, bytecode, amount, parameters }, override) {
    const factory = this.client.cfx.Contract({ abi, bytecode })
    const tx = factory.constructor.call(...parameters)
    return new ContractTx(this.client, tx, null, override)
  }

  async estimate (tx) {
    const gasPrice = await this.client.callRpc('cfx_gasPrice', [])
    const result = await tx.estimate({ from: tx.from })
    return {
      gas: result.gasLimit && result.gasLimit.toString() || '',
      gasPrice: BigInt(gasPrice).toString(10),
      storageLimit: result.storageCollateralized && result.storageCollateralized.toString() || ''
    }
  }

  sendTransaction (tx, browserExtension) {
    if (browserExtension && browserExtension.currentAccount === tx.from) {
      return tx.send(null, browserExtension)
    } else {
      const sp = signatureProvider(tx.from)
      return tx.send(sp)
    }
  }
}
