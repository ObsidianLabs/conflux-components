const semverLt = require('semver/functions/lt')

const { IpcChannel } = require('@obsidians/ipc')
const { DockerImageChannel } = require('@obsidians/docker')

const semver = require('semver')

class CompilerManager extends IpcChannel {
  constructor () {
    super('conflux-truffle')
    new DockerImageChannel('confluxchain/conflux-truffle', {
      filter: tag => semver.valid(tag),
      sort: (x, y) => semverLt(x, y) ? 1 : -1
    })
  }

  resize ({ cols, rows }) {
    this.pty.resize({ cols, rows })
  }

  kill () {
    this.pty.kill()
  }
}

module.exports = CompilerManager