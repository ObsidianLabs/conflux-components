import platform from '@obsidians/platform'

const networks = [
  {
    id: 'testnet',
    group: 'testnet',
    name: 'Testnet',
    fullName: 'Conflux Testnet',
    icon: 'fas fa-vial',
    notification: 'Switched to <b>Conflux Testnet</b> network.',
    url: 'https://test.confluxrpc.org',
    chainId: 1,
    explorer: 'https://testnet.confluxscan.io/v1',
  },
  {
    id: 'tethys',
    group: 'mainnet',
    name: 'Tethys',
    fullName: 'Conflux Tethys',
    icon: 'fas fa-globe',
    notification: 'Switched to <b>Conflux Tethys</b> network.',
    url: 'https://main.confluxrpc.org',
    chainId: 1029,
    explorer: 'https://confluxscan.io/v1',
  }
]
if (platform.isDesktop) {
  networks.unshift({
    id: 'dev',
    group: 'default',
    name: 'Development',
    fullName: 'Development Network',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Development</b> network.',
    url: 'http://localhost:12537',
    chainId: 0,
  })
}

export default networks