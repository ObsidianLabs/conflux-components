const fs = require('fs')
const path = require('path')
const os = require('os')
const TOML = require('@iarna/toml')
const semverLt = require('semver/functions/lt')
const semverValid = require('semver/functions/valid')

const { IpcChannel } = require('@obsidians/ipc')
const { DockerImageChannel } = require('@obsidians/docker')

class InstanceManager extends IpcChannel {
  constructor () {
    super('conflux-node')
    this.dockerChannel = new DockerImageChannel('confluxchain/conflux-rust', {
      filter: tag => semverValid(tag),
      sort: (x, y) => semverLt(x, y) ? 1 : -1
    })
  }

  async create ({ name, version, miner, genesis_secrets, chain = 'dev' }) {
    const tmpdir = os.tmpdir()
    const configPath = path.join(tmpdir, `conflux.toml`)
    const logPath = path.join(tmpdir, `log.yaml`)
    const genesis = path.join(tmpdir, 'genesis_secrets.txt')

    await this.exec(`docker volume create --label version=${version},chain=${chain} conflux-${name}`)

    await this.exec(`docker run -di --rm --name conflux-config-${name} -v conflux-${name}:/conflux-node confluxchain/conflux-rust:${version} /bin/bash`)

    await this.exec(`docker cp conflux-config-${name}:/root/run/default.toml ${configPath}`)
    await this.exec(`docker cp conflux-config-${name}:/root/run/log.yaml ${logPath}`)
    await this.exec(`docker cp conflux-config-${name}:/root/run/genesis_secrets.txt ${genesis}`)

    const configStr = fs.readFileSync(configPath, 'utf8')
    const config = TOML.parse(configStr)
    config.mode = 'dev'
    config.chain_id = 0
    config.mining_author = miner.replace('0x', '')
    config.genesis_secrets = 'genesis_secrets.txt'

    fs.writeFileSync(configPath, TOML.stringify(config))
    fs.writeFileSync(genesis, genesis_secrets.map(k => k.substr(2)).join('\n') + '\n')

    await this.exec(`docker cp ${configPath} conflux-config-${name}:/conflux-node/default.toml`)
    await this.exec(`docker cp ${logPath} conflux-config-${name}:/conflux-node/log.yaml`)
    await this.exec(`docker cp ${genesis} conflux-config-${name}:/conflux-node/genesis_secrets.txt`)
    await this.exec(`docker stop conflux-config-${name}`)

    fs.unlinkSync(genesis)
  }

  async list (chain = 'dev') {
    const { logs: volumes } = await this.exec(`docker volume ls --format "{{json . }}"`)
    const instances = volumes.split('\n').filter(Boolean).map(JSON.parse).filter(x => x.Name.startsWith('conflux-'))
    const instancesWithLabels = instances.map(i => {
      const labels = {}
      i.Labels.split(',').forEach(x => {
        const [name, value] = x.split('=')
        labels[name] = value
      })
      i.Labels = labels
      return i
    })
    return instancesWithLabels.filter(x => x.Labels.chain === chain)
  }

  async readConfig ({ name, version }) {
    const configPath = path.join(os.tmpdir(), `conflux.toml`)
    try {
      fs.unlinkSync(configPath)
    } catch (e) {}
    await this.exec(`docker run --rm -di --name conflux-config-${name} -v conflux-${name}:/conflux-node confluxchain/conflux-rust:${version} /bin/bash`)
    await this.exec(`docker cp conflux-config-${name}:/conflux-node/default.toml ${configPath}`)
    let config
    try {
      config = fs.readFileSync(configPath, 'utf8')
    } catch (e) {
      return ''
    }
    await this.exec(`docker stop conflux-config-${name}`)
    return config
  }

  async writeConfig ({ name, version, content }) {
    const configPath = path.join(os.tmpdir(), 'conflux.toml')
    fs.writeFileSync(configPath, content, 'utf8')
    await this.exec(`docker run --rm -di --name conflux-config-${name} -v conflux-${name}:/conflux-node confluxchain/conflux-rust:${version} /bin/bash`)
    await this.exec(`docker cp ${configPath} conflux-config-${name}:/conflux-node/default.toml`)
    await this.exec(`docker stop conflux-config-${name}`)
  }

  async delete (name) {
    await this.exec(`docker volume rm conflux-${name}`)
  }
}

module.exports = InstanceManager