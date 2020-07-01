import Sdk from '@obsidians/conflux-sdk'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class NodeManager {
  constructor () {
    this._sdk = null
    this._terminal = null
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

  set status (v) {
    this._status = v
  }

  async start ({ name, version, chain }) {
    if (!this._terminal) {
      return
    }

    const startDocker = this.generateCommands({ name, version })
    await this._terminal.exec(startDocker, { resolveOnFirstLog: true })
    return {
      url: 'http://localhost:12537',
    }
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
      `obsidians/conflux:${version}`,
      `../conflux-rust/target/release/conflux --config default.toml`
    ].join(' ')
  }

  updateLifecycle (lifecycle, params) {
    if (this._status) {
      this._status.setState({ lifecycle })
    }
    if (params) {
      this._sdk = new Sdk(params)
    } else {
      this._sdk = null
    }
  }

  switchNetwork (network) {
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

  async stop ({ name, version }) {
    if (this._terminal) {
      await this._terminal.exec(`docker stop conflux-${name}-${version}`)
    }
  }
}

export default new NodeManager()