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
  },
  {
    id: 'testnet',
    group: 'default',
    name: 'Testnet',
    fullName: 'Testnet',
    icon: 'fas fa-vial',
    notification: 'Switched to <b>Testnet</b> network.',
    url: 'http://testnet-jsonrpc.conflux-chain.org:12537',
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
