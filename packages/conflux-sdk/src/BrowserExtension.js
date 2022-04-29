import redux from '@obsidians/redux'
import networks from './networks'

export default class BrowserExtension {
  static Init (networkManager) {
    if (window.conflux) {
      return new BrowserExtension(networkManager, window.conflux)
    }
  }

  constructor (networkManager, conflux) {
    this.name = 'Conflux Portal'
    this.networkManager = networkManager
    this._enabled = false

    this._currentAccount = ''
    if (conflux) {
      this._enabled = true
      this.ethereum = conflux
      this.conflux = conflux
      this.prefix = 'cfx'
      this.initialize(conflux)
    }
  }

  get isEnabled () {
    return this._enabled
  }

  async currentAccount () {
    const account = await this.conflux.request({method: "cfx_accounts"})
    return account[0]
  }

  get allAccounts () {
    return this._accounts
  }
  
  async initialize (conflux) {
    conflux.on('chainChanged', this.onChainChanged.bind(this))
    const status = await conflux.request('cfx_getStatus')
    this.onChainChanged(status.chainId)

    conflux.on('accountsChanged', this.onAccountsChanged.bind(this))
    await this.requestAccounts()
    
    const allAccounts = await this.getAllAccounts()
    this._accounts = allAccounts
    redux.dispatch('UPDATE_UI_STATE', { browserAccounts: allAccounts })
  }

  async requestAccounts () {
    try {
      const accounts = await this.conflux.request('cfx_requestAccounts')
      this.onAccountsChanged(accounts)
    } catch (e) {
      console.warn(e)
    }
  }

  async onChainChanged (chainId) {
    const intChainId = parseInt(chainId)
    const network = networks.find(n => n.chainId === intChainId)
    if (network) {
      this.networkManager.setNetwork(network, true)
    }
  }

  async getChainId(){
    return await this.conflux.request({ method: 'cfx_chainId' })
  }

  async switchChain(chainId){
    const res = await this.conflux.request({
      method: 'wallet_switchConfluxChain',
      params: [{
        chainId,
      }]
    })
    return res
  }

  async addChain({chainId, chainName, rpcUrls}) {
    return await this.conflux.request({
      method: 'wallet_addConfluxChain',
      params: [{
        chainId,
        chainName,
        rpcUrls,
      }],
    })
  }

  async getAllAccounts () {
    return this.conflux.request('cfx_requestAccounts')
    // const result = await this.conflux.request('wallet_getPermissions')
    // const found = result[0].caveats.find(c => c.type === 'filterResponse')
    // return found ? found.value : []
  }

  async onAccountsChanged (accounts) {

    redux.dispatch('UPDATE_UI_STATE', { signer: accounts[0], browserAccounts: accounts })
  }

  sendTransaction (tx, callback) {
    tx.value = '0x' + BigInt(tx.value || 0).toString(16)
    this.conflux.request({
      method: 'cfx_sendTransaction',
      params: [tx],
      from: tx.from,
    }, console.log)
    console.log("DONE!!!")
  }
}