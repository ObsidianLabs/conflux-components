const PrivateKeyAccount = require('js-conflux-sdk/src/wallet/PrivateKeyAccount')
const { ethers } = require('ethers')
import { Conflux } from 'js-conflux-sdk'

module.exports = class CfxClient {
  constructor ({ url, chainId }) {
    this.chainId = chainId
    this.provider = new Conflux({
      url,
      networkId: chainId,
    })
  }

  async rpc (method, params) {
    return await this.provider.send(method, params)
  }

  async sign (tx, secret) {
    const account = this.accountFrom(secret)
    tx.from = account.address
    const accountInfo = await this.rpc('cfx_getAccount', [tx.from])
    tx.nonce = accountInfo.nonce
    const signedTx = await account.signTransaction(tx)
    return signedTx.serialize()
  }

  accountFrom (secret) {
    let wallet
    if (secret.startsWith('0x')) {
      wallet = new ethers.Wallet(secret)
    } else {
      wallet = ethers.Wallet.fromMnemonic(secret, `m/44'/503'/0'/0/0`)
    }
    return new PrivateKeyAccount(wallet.privateKey, this.chainId)
  }

  async sendRawTransaction (tx) {
    return this.rpc('cfx_sendRawTransaction', [tx])
  }
}
