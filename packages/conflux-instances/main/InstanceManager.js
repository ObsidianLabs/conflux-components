const fs = require('fs')
const path = require('path')
const { COPYFILE_FICLONE_FORCE } = fs.constants

const { IpcChannel } = require('@obsidians/ipc')

const semver = require('semver')

class InstanceManager extends IpcChannel {
  constructor () {
    super('conflux-node')
  }

  async create ({ name, version, genesis_secrets, chain = 'dev' }) {
    await this.pty.exec(`docker volume create --label version=${version},chain=${chain} conflux-${name}`)

    const configPath = path.join('/tmp', `${chain}.toml`)
    const logPath = path.join('/tmp', `log.yaml`)
    const genesis = path.join('/tmp', 'genesis_secrets.txt')

    const configContent = fs.readFileSync(path.join(__dirname, 'chain-configs', `${chain}.toml`))
    fs.writeFileSync(configPath, configContent)

    const logContent = fs.readFileSync(path.join(__dirname, 'chain-configs', 'log.yaml'))
    fs.writeFileSync(logPath, logContent)

    fs.writeFileSync(genesis, genesis_secrets)

    await this.pty.exec(`docker run -d --rm -it --name conflux-config-${name} -v conflux-${name}:/conflux-node confluxchain/conflux-rust:${version} /bin/bash`)
    await this.pty.exec(`docker cp ${configPath} conflux-config-${name}:/conflux-node/default.toml`)
    await this.pty.exec(`docker cp ${logPath} conflux-config-${name}:/conflux-node/log.yaml`)
    await this.pty.exec(`docker cp ${genesis} conflux-config-${name}:/conflux-node/genesis_secrets.txt`)
    await this.pty.exec(`docker stop conflux-config-${name}`)

    fs.unlinkSync(genesis)
  }

  async list (chain = 'dev') {
    const { logs: volumes } = await this.pty.exec(`docker volume ls --format "{{json . }}"`)
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
    await this.pty.exec(`docker volume rm conflux-${name}`)
  }

  async versions () {
    const { logs: images } = await this.pty.cp(`docker images confluxchain/conflux-rust --format "{{json . }}"`)
    const versions = images.split('\n').filter(Boolean).map(JSON.parse).filter(x => semver.valid(x.Tag))
    return versions
  }

  async deleteVersion (version) {
    await this.pty.exec(`docker rmi confluxchain/conflux-rust:${version}`)
  }

  async remoteVersions (size) {
    const res = await this.fetch(`http://registry.hub.docker.com/v1/repositories/confluxchain/conflux-rust/tags`)
    return JSON.parse(res)
      .filter(({ name }) => semver.valid(name))
      .sort((x, y) => semver.lt(x.name, y.name) ? 1 : -1)
      .slice(0, size)
  }

  async any () {
    const { versions = [] } = await this.versions()
    return !!versions.length
  }
}

module.exports = InstanceManager