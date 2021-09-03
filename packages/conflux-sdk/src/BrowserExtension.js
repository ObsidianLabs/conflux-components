import redux from '@obsidians/redux'
import networks from './networks'

export default class BrowserExtension {
  static Init (networkManager) {
    if (window.conflux && window.conflux.isConfluxPortal) {
      return new BrowserExtension(networkManager, window.conflux)
    }
  }

  constructor (networkManager, conflux) {
    this.name = 'Conflux Portal'
    this.networkManager = networkManager
    this._accounts = []
    this._enabled = false
    if (conflux && conflux.isConfluxPortal) {
      this._enabled = true
      this.conflux = conflux
      this.initialize(conflux)
    }
  }

  get isEnabled () {
    return this._enabled
  }

  get currentAccount () {
    return this.conflux.selectedAddress
  }

  get allAccounts () {
    return this._accounts
  }
  
  async initialize (conflux) {
    conflux.on('networkChanged', this.onChainChanged.bind(this))
    const status = await conflux.send('cfx_getStatus')
    this.onChainChanged(status.chainId)

    conflux.on('accountsChanged', this.onAccountsChanged.bind(this))
    await this.requestAccounts()
    
    const allAccounts = await this.getAllAccounts()
    this._accounts = allAccounts
    redux.dispatch('UPDATE_UI_STATE', { browserAccounts: allAccounts })
  }

  async requestAccounts () {
    try {
      const accounts = await this.conflux.send('cfx_requestAccounts')
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

  async getAllAccounts () {
    return this.conflux.send('cfx_requestAccounts')
    // const result = await this.conflux.send('wallet_getPermissions')
    // const found = result[0].caveats.find(c => c.type === 'filterResponse')
    // return found ? found.value : []
  }

  async onAccountsChanged (accounts) {
    redux.dispatch('UPDATE_UI_STATE', { signer: accounts[0], browserAccounts: accounts })
  }

  sendTransaction (tx, callback) {
    tx.value = BigInt(tx.value || 0).toString(16)
    this.conflux.sendAsync({
      method: 'cfx_sendTransaction',
      params: [tx],
      from: tx.from,
    }, callback)
  }
}