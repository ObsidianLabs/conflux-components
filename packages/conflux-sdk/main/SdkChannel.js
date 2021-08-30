const { IpcChannel } = require('@obsidians/ipc')
const { RpcServer } = require('@obsidians/eth-sdk')
const CfxClient = require('./CfxClient')

class SdkChannel extends IpcChannel {
  constructor (keypairManager) {
    super('sdk')

    this.rpcServer = new RpcServer(CfxClient, keypairManager, {
      platon_accounts: 'cfx_accounts',
      platon_sendTransaction: 'cfx_sendTransaction',
    })
  }

  setNetwork (option) {
    this.rpcServer.setNetwork(option)
  }

  unsetNetwork () {
    this.rpcServer.unsetNetwork()
  }

  async rpc (method, params) {
    return await this.rpcServer.client.rpc(method, params)
  }
}

module.exports = SdkChannel
