const fs = require('fs')
const path = require('path')
const semverLt = require('semver/functions/lt')
const semverValid = require('semver/functions/valid')

const { IpcChannel } = require('@obsidians/ipc')
const { DockerImageChannel } = require('@obsidians/docker')

class InstanceManager extends IpcChannel {
  constructor () {
    super('conflux-node')
    new DockerImageChannel('confluxchain/conflux-rust', {
      filter: tag => semverValid(tag),
      sort: (x, y) => semverLt(x, y) ? 1 : -1
    })
  }

  async create ({ name, version, genesis_secrets, chain = 'dev' }) {
    await this.exec(`docker volume create --label version=${version},chain=${chain} conflux-${name}`)

    const configPath = path.join('/tmp', `${chain}.toml`)
    const logPath = path.join('/tmp', `log.yaml`)
    const genesis = path.join('/tmp', 'genesis_secrets.txt')

    const configContent = fs.readFileSync(path.join(__dirname, 'chain-configs', `${chain}.toml`))
    fs.writeFileSync(configPath, configContent)

    const logContent = fs.readFileSync(path.join(__dirname, 'chain-configs', 'log.yaml'))
    fs.writeFileSync(logPath, logContent)

    fs.writeFileSync(genesis, genesis_secrets)

    await this.exec(`docker run -d --rm -it --name conflux-config-${name} -v conflux-${name}:/conflux-node confluxchain/conflux-rust:${version} /bin/bash`)
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

  async delete (name) {
    await this.exec(`docker volume rm conflux-${name}`)
  }
}

module.exports = InstanceManager