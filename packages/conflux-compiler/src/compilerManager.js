import { DockerImageChannel } from '@obsidians/docker'
import notification from '@obsidians/notification'
import fileOps from '@obsidians/file-ops'

class Compiler {
  constructor () {
    this.cfxtruffle = new DockerImageChannel('obsidians/conflux-truffle')
    this.solc = new DockerImageChannel('ethereum/solc')
    this._terminal = null
    this._button = null
    this.notification = null
  }

  set terminal (v) {
    this._terminal = v
  }

  set button (v) {
    this._button = v
  }

  get projectRoot () {
    if (!this._terminal) {
      throw new Error('CompilerTerminal is not instantiated.')
    }
    return this._terminal.props.cwd
  }

  focus () {
    if (this._terminal) {
      this._terminal.focus()
    }
  }

  async build (config = {}) {
    const projectRoot = this.projectRoot

    if (!config?.cfxtruffle) {
      notification.error('No Conflux Truffle Version', `Please select a version for conflux truffle in project settings.`)
      throw new Error('No conflux truffle version.')
    }

    const allVersions = await this.cfxtruffle.versions()
    if (!allVersions.find(v => v.Tag === config.cfxtruffle)) {
      notification.error(`Conflux Truffle ${config.cfxtruffle} not Installed`, `Please install the version in <b>Conflux Truffle Manager</b> or select another version in project settings.`)
      throw new Error('Conflux Truffle version not installed')
    }

    if (!config.solc) {
      notification.error('No Solc Version', `Please select a version for solc in project settings.`)
      throw new Error('No solc version.')
    }

    const allSolcVersions = await this.solc.versions()
    if (config.solc !== 'default' && !allSolcVersions.find(v => v.Tag === config.solc)) {
      notification.error(`Solc ${config.solc} not Installed`, `Please install the version in <b>Solc Manager</b> or select another version in project settings.`)
      throw new Error('Solc version not installed')
    }

    this._button.setState({ building: true })
    this.notification = notification.info(`Building Project`, `Building...`, 0)

    const cmd = this.generateBuildCmd({ projectRoot, config })
    const result = await this._terminal.exec(cmd)
    if (result.code) {
      this._button.setState({ building: false })
      this.notification.dismiss()
      notification.error('Build Failed', `Code has errors.`)
      throw new Error(result.logs)
    }

    this._button.setState({ building: false })
    this.notification.dismiss()

    notification.success('Build Successful', `The smart contract is compiled.`)
  }

  async stop () {
    if (this._terminal) {
      this._terminal.execAsChildProcess(`docker stop -t 1 truffle-compile`)
      await this._terminal.stop()
    }
  }

  generateBuildCmd({ projectRoot, config }) {
    // const { base: name } = fileOps.current.path.parse(projectRoot)
    const projectDir = fileOps.current.getDockerMountPath(projectRoot)
    const cmd = [
      `docker run -t --rm --name truffle-compile`,
      '-v /var/run/docker.sock:/var/run/docker.sock',
      `-v "${projectDir}:${projectDir}"`,
      `-w "${projectDir}"`,
      `obsidians/conflux-truffle:${config.cfxtruffle}`,
      `cfxtruffle compile`,
    ]
    
    if (config.solc !== 'default') {
      cmd.push(`--compilers.solc.version '${config.solc}'`)
      cmd.push(`--compilers.solc.docker 1`)
    }
    
    return cmd.join(' ')
  }
}

export default new Compiler()