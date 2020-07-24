import fileOps from '@obsidians/file-ops'
import Sdk from '@obsidians/conflux-sdk'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

class NodeManager {
  constructor () {
    this._sdk = null
    this._terminal = null
    this._configModal = null
    this.network = null
  }

  get sdk () {
    return this._sdk
  }

  set terminal (v) {
    this._terminal = v
  }

  set configModal (v) {
    this._configModal = v
  }

  set status (v) {
    this._status = v
  }

  async start ({ name, version, chain }) {
    if (!this._terminal) {
      return
    }

    if (chain === 'oceanus-mining') {
      return this.startOceanusMiner()
    }

    const startDocker = this.generateCommands({ name, version })
    await this._terminal.exec(startDocker, { resolveOnFirstLog: true })
    return {
      url: 'http://localhost:12537',
      chainId: 0,
      id: `local.${name}`,
    }
  }

  async startOceanusMiner () {
    const confluxDir = this.getConfluxBinFolder()
    let configFile = await fileOps.current.readFile(fileOps.current.path.join(confluxDir, 'default.toml'))
    let miner = configFile.match(/mining_author="(.+)"/)
    let ip = configFile.match(/public_address="(.+)"/)
    try {
      ip = await fetch(`http://download.obsidians.io/ip`).then(res => res.text())
    } catch (e) {
      ip = (ip && ip[1]) ? ip[1].split(':')[0] : ''
    }

    const result = await this._configModal.openModal({ miner: miner ? miner[1] : '', ip })
    if (!result) {
      throw new Error('NodeConfigModal was cloased.')
    }

    miner = result.miner
    ip = result.ip

    configFile = configFile.replace(`# start_mining=true`, `start_mining=true`)
    configFile = configFile.replace(`# mining_author`, `mining_author`)
    configFile = configFile.replace(/mining_author=".+"/, `mining_author="${miner.replace('0x', '')}"`)
    configFile = configFile.replace(`# public_address=`, `public_address=`)
    configFile = configFile.replace(/public_address=".+"/, `public_address="${ip}:32323"`)

    await fileOps.current.writeFile(fileOps.current.path.join(confluxDir, 'default.toml'), configFile)

    await this._terminal.exec('ulimit -n 10000', { cwd: confluxDir })
    await this._terminal.exec('./conflux --config default.toml --full 2>stderr.txt', { resolveOnFirstLog: true, cwd: confluxDir })
  }

  getConfluxBinFolder () {
    return fileOps.current.path.join(fileOps.current.homePath, 'Conflux Studio', '.bin', 'run')
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
    if (this._terminal) {
      if (chain === 'oceanus-mining') {
        await this._terminal.stop()
      } else {
        await this._terminal.exec(`docker stop conflux-${name}-${version}`)
      }
    }
  }
}

export default new NodeManager()