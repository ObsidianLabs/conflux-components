const { IpcChannel } = require('@obsidians/ipc')

class CompilerManager extends IpcChannel {
  constructor () {
    super('truffle')
  }

  async versions () {
    const { logs: images } = await this.pty.exec(`docker images confluxchain/conflux-truffle --format "{{json . }}"`)
    const versions = images.split('\n').filter(Boolean).map(JSON.parse)
    return versions
  }

  async deleteVersion (version) {
    await this.pty.exec(`docker rmi confluxchain/conflux-truffle:${version}`)
  }

  async remoteVersions (size = 10) {
    const res = await this.fetch(`http://registry.hub.docker.com/v1/repositories/confluxchain/conflux-truffle/tags`)
    return JSON.parse(res)
      .sort((x, y) => x.name < y.name ? 1 : -1)
      .slice(0, size)
  }

  async any () {
    const { versions = [] } = await this.versions()
    return !!versions.length
  }

  resize ({ cols, rows }) {
    this.pty.resize({ cols, rows })
  }

  kill () {
    this.pty.kill()
  }
}

module.exports = CompilerManager