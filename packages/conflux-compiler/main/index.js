const { DockerImageChannel } = require('@obsidians/docker')

class CompilerManager {
  constructor () {
    this.cfxtruffle = new DockerImageChannel('obsidians/conflux-truffle')
    this.solc = new DockerImageChannel('ethereum/solc')
  }
}

module.exports = CompilerManager