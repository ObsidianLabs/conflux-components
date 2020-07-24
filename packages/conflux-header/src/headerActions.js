import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import nodeManager from '@obsidians/conflux-node'

import { List } from 'immutable'

export const networks = List([
  {
    id: 'dev',
    group: 'default',
    name: 'Development',
    fullName: 'Development Network',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Development</b> network.',
    chainId: 0,
  },
  {
    id: 'testnet',
    group: 'testnet',
    name: 'Testnet',
    fullName: 'Conflux Testnet',
    icon: 'fas fa-vial',
    notification: 'Switched to <b>Conflux Testnet</b> network.',
    url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
    chainId: 1,
    explorer: 'https://testnet.confluxscan.io/api',
  },
  {
    id: 'oceanus',
    group: 'mainnet',
    name: 'Oceanus',
    fullName: 'Conflux Oceanus',
    icon: 'fas fa-globe',
    notification: 'Switched to <b>Conflux Oceanus</b> network.',
    url: 'http://mainnet-jsonrpc.conflux-chain.org:12537',
    chainId: 2,
    explorer: 'https://confluxscan.io/api',
  },
  {
    id: 'oceanus-mining',
    group: 'mainnet',
    name: 'Oceanus Mining',
    fullName: 'Oceanus Mining',
    icon: 'fas fa-hammer',
    notification: 'Switched to <b>Conflux Oceanus Mining</b> mode.',
    url: 'http://mainnet-jsonrpc.conflux-chain.org:12537',
    chainId: 2,
    explorer: 'https://confluxscan.io/api',
  }
])


export class HeaderActions {
  constructor() {
    this.history = null
    this.newProjectModal = null
  }

  selectContract (network, contract) {
    redux.dispatch('SELECT_CONTRACT', { network, contract })
  }

  selectAccount (network, account) {
    redux.dispatch('SELECT_ACCOUNT', { network, account })
  }

  removeFromStarred (network, account) {
    redux.dispatch('REMOVE_ACCOUNT', { network, account })
  }

  async setNetwork (newtorkId) {
    if (newtorkId === redux.getState().network) {
      return
    }
    const network = networks.find(n => n.id === newtorkId)
    if (!network) {
      return
    }
    nodeManager.switchNetwork(network)
    redux.dispatch('SELECT_NETWORK', network.id)
    notification.success(`Network`, network.notification)
    this.history.push(`/network/${network.id}`)
  }
}

export default new HeaderActions()
