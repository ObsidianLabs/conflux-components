import fileOps from '@obsidians/file-ops'
import Sdk from '@obsidians/conflux-sdk'
import notification from '@obsidians/notification'
import instance from '@obsidians/conflux-instances'

import { getCachingKeys, dropByCacheKey } from 'react-router-cache-route'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

  async start ({ name, version, chain }) {
    if (!this._terminal) {
      throw new Error()
    }

    const versions = await instance.node.versions()
    if (!versions.find(v => v.Tag === version)) {
      notification.error(`Conflux Node ${version} not Installed`, `Please install the version in <b>Conflux Version Manager</b>`)
      throw new Error('Version not installed')
    }

    const startDocker = this.generateCommands({ name, version })
    await this._terminal.exec(startDocker, { resolveOnFirstLog: true })
    return {
      url: 'http://localhost:12537',
      chainId: 0,
      id: `local.${name}`,
    }
  }

  getConfluxBinFolder () {
    return fileOps.current.path.join(fileOps.current.workspace, '.bin', 'run')
  }

  generateCommands ({ name, version }) {
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
      this._sdk = new Sdk(params)
    } else {
      // this._sdk = null
    }
  }

  switchNetwork (network) {
    this.network = network
    if (network.url) {
      this._sdk = new Sdk(network)
    } else {
      this._sdk = null
    }
  }

  updateBlockNumber (blockNumber) {
    if (this._status) {
      this._status.setState({ blockNumber })
    }
  }

  async stop ({ name, version, chain }) {
    const cachingKeys = getCachingKeys()
    cachingKeys.filter(key => key.startsWith('contract-') || key.startsWith('account-')).forEach(dropByCacheKey)

    if (this._terminal) {
      const n = notification.info('Stopping Conflux Node...', '', 0)
      await this._terminal.execAsChildProcess(`docker stop conflux-${name}-${version}`)
      n.dismiss()
    }
  }
}

export default new NodeManager()