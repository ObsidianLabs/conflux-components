const semverLt = require('semver/functions/lt')
const semverValid = require('semver/functions/valid')

const { DockerImageChannel } = require('@obsidians/docker')

class CompilerManager {
  constructor () {
    this.dockerChannel = new DockerImageChannel('confluxchain/conflux-truffle', {
      filter: tag => semverValid(tag),
      sort: (x, y) => semverLt(x, y) ? 1 : -1
    })
  }
}

module.exports = CompilerManager