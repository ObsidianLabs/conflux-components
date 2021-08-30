const { Conflux } = require('js-conflux-sdk')
const { Wallet } = require('@ethersproject/wallet')

module.exports = class CfxClient {
  constructor ({ url }) {
    this.cfx = new Conflux({
      url,
      defaultGasPrice: 100,
      defaultGas: 1000000,
      networkId: chainId,
    })
  }

  async rpc (method, params) {
    return await this.cfx.provider.call(method, ...params)
  }

  async sign (tx, secret) {
    const wallet = this.walletFrom(secret)
    tx.nonce = tx.nonce || await this.web3.platon.getTransactionCount(tx.from)
    const result = await this.web3.platon.accounts.signTransaction(tx, wallet.privateKey)
    return result.rawTransaction
  }

  walletFrom (secret) {
    let wallet
    if (secret.startsWith('0x')) {
      wallet = new Wallet(secret)
    } else {
      wallet = Wallet.fromMnemonic(secret)
    }
    return wallet.connect(this.web3.provider)
  }

  async sendRawTransaction (tx) {
    const result = await this.web3.platon.sendSignedTransaction(tx)
    return result.transactionHash
  }
}
