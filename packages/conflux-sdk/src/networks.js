import platform from '@obsidians/platform'

const networks = [
  {
    id: 'testnet',
    group: 'testnet',
    name: 'Testnet',
    fullName: 'Conflux Testnet',
    icon: 'fas fa-vial',
    notification: 'Switched to <b>Conflux Testnet</b> network.',
    url: 'https://portal-test.confluxrpc.com',
    chainId: 1,
    explorer: 'https://api-testnet.confluxscan.net',
    explorerApi: 'https://api-testnet.confluxscan.net',
    explorerScan: 'https://testnet.confluxscan.io',
    symbol: 'CFX',
  },
  {
    id: 'tethys',
    group: 'mainnet',
    name: 'Tethys',
    fullName: 'Conflux Tethys',
    icon: 'fas fa-globe',
    notification: 'Switched to <b>Conflux Tethys</b> network.',
    url: 'https://portal-main.confluxrpc.com',
    chainId: 1029,
    explorer: 'https://api.confluxscan.net',
    explorerApi: 'https://api.confluxscan.net',
    explorerScan: 'https://www.confluxscan.io',
    symbol: 'CFX',
  }
]
if (platform.isDesktop) {
  networks.push({
    id: 'custom',
    group: 'others',
    name: 'Custom',
    fullName: 'Custom Network',
    icon: 'fas fa-edit',
    notification: 'Switched to <b>Custom</b> network.',
    symbol: 'CFX',
  })
  networks.unshift({
    id: 'dev',
    group: 'default',
    name: 'Development',
    fullName: 'Development Network',
    icon: 'fas fa-laptop-code',
    notification: 'Switched to <b>Development</b> network.',
    url: 'http://localhost:12537',
    chainId: 999,
    symbol: 'CFX',
  })
}

export default networks