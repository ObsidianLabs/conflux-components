import { networkManager, instanceChannel } from '@obsidians/conflux-network'
import notification from '@obsidians/notification'

import { getCachingKeys, dropByCacheKey } from 'react-router-cache-route'

class NodeManager {
  constructor () {
    this._sdk = null
    this._terminal = null
    this._minerTerminal = null
    this._configModal = null
    this.network = null
  }

  get sdk () {
    return this._sdk
  }

  set terminal (v) {
    this._terminal = v
  }

  set minerTerminal (v) {
    this._minerTerminal = v
  }

  set configModal (v) {
    this._configModal = v
  }

  set status (v) {
    this._status = v
  }

  async start ({ name, version }) {
    if (!this._terminal) {
      throw new Error()
    }

    const versions = await instanceChannel.node.versions()
    if (!versions.find(v => v.Tag === version)) {
      notification.error(`Conflux Node ${version} not Installed`, `Please install the version in <b>Conflux Version Manager</b>`)
      throw new Error('Version not installed')
    }

    const startDocker = this.generateCommand({ name, version })
    await this._terminal.exec(startDocker, {
      resolveOnFirstLog: true,
      stopCommand: `docker stop conflux-${name}-${version}`,
    })
    return {
      url: 'http://localhost:12537',
      chainId: 0,
      id: `local.${name}`,
    }
  }

  generateCommand ({ name, version }) {
    const containerName = `conflux-${name}-${version}`

    return [
      'docker run -it --rm',
      `--name ${containerName}`,
      `-p 12535:12535`,
      `-p 12536:12536`,
      `-p 12537:12537`,
      `-v conflux-${name}:/conflux-node`,
      `-w /conflux-node`,
      `--entrypoint conflux`,
      `confluxchain/conflux-rust:${version}`,
      `--config default.toml`
    ].join(' ')
  }

  updateLifecycle (lifecycle, params) {
    if (this._status) {
      this._status.setState({ lifecycle })
    }
    if (params) {
      networkManager.updateSdk(params)
    }
  }

  updateBlockNumber (blockNumber) {
    if (this._status) {
      this._status.setState({ blockNumber })
    }
  }

  async stop () {
    const cachingKeys = getCachingKeys()
    cachingKeys.filter(key => key.startsWith('contract-') || key.startsWith('account-')).forEach(dropByCacheKey)
    if (this._terminal) {
      const n = notification.info('Stopping Conflux Node...', '', 0)
      await this._terminal.stop()
      n.dismiss()
    }
  }
}

export default new NodeManager()