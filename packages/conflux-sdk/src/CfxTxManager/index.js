import utils from '../utils'
import { TransferTx, ContractTx } from './Tx'

import signatureProvider from './signatureProvider'
import ERC20 from '../redux/abi/ERC20.json'

export default class CfxTxManager {
  constructor (client) {
    this.client = client
  }

  async getTransferTx (Contract, { from, to, token, amount }, override) {
    if (token === 'core' || !token) {
      const value = utils.unit.toValue(amount)
      return new TransferTx(this.client, { from, to, value, ...override })
    } else {
      const value = utils.format.big(amount).times(utils.format.big(10).pow(token.decimals)).toString()
      const contract = new Contract({ address: token.address, abi: ERC20 }, this.client)
      return contract.execute('transfer', { array: [to, value] }, { ...override, from })
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

  async sendTransaction (tx, browserExtension) {
    if (browserExtension && await browserExtension.currentAccount() === tx.from) {
      return tx.send(null, browserExtension)
    } else {
      const sp = signatureProvider(tx.from)
      return tx.send(sp)
    }
  }
}
