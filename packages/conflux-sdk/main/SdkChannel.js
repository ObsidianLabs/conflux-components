const { IpcChannel } = require('@obsidians/ipc')
const { RpcServer } = require('@obsidians/eth-sdk')
const CfxClient = require('./CfxClient')

class SdkChannel extends IpcChannel {
  constructor (keypairManager) {
    super('sdk')

    this.rpcServer = new RpcServer(CfxClient, {
      keypairManager,
      keypairFilter: (keypair, client) => {
        const chainId = client.chainId
        if (chainId === 1) {
          return keypair.address.startsWith('cfxtest:')
        } else if (chainId === 1029) {
          return keypair.address.startsWith('cfx:')
        } else {
          return keypair.address.startsWith('0x')
        }
      },
      rpcMap: {
        accounts: 'eth_accounts',
        cfx_sendTransaction: 'eth_sendTransaction',
      }
    })
  }

  setNetwork (option) {
    this.rpcServer.setNetwork(option)
  }

  unsetNetwork () {
    this.rpcServer.unsetNetwork()
  }
}

module.exports = SdkChannel
