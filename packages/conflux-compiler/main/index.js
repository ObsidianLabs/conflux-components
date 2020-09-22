const { DockerImageChannel } = require('@obsidians/docker')
const semverValid = require('semver/functions/valid')

class CompilerManager {
  constructor () {
    this.cfxtruffle = new DockerImageChannel('obsidians/conflux-truffle')
    this.solc = new DockerImageChannel('ethereum/solc', {
      filter: v => semverValid(v) && !v.endsWith('alpine')
    })
  }
}

module.exports = CompilerManager