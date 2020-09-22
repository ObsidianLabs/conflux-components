const { DockerImageChannel } = require('@obsidians/docker')

class CompilerManager {
  constructor () {
    this.dockerChannel = new DockerImageChannel('confluxchain/conflux-truffle')
  }
}

module.exports = CompilerManager