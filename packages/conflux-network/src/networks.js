import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import { List } from 'immutable'

const networkList = [
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
  }
]
if (platform.isDesktop) {
  networkList.unshift({
    id: 'dev',
    group: 'default',
    name: 'Development',
    fullName: 'Development Network',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Development</b> network.',
    chainId: 0,
  })
}
export default List(networkList)
