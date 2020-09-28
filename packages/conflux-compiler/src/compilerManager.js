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

  get compilerVersion () {
    if (!this._button) {
      throw new Error('CompilerButton is not instantiated.')
    }
    return this._button.props.compilerVersion
  }

  focus () {
    if (this._terminal) {
      this._terminal.focus()
    }
  }

  async build (config = {}) {
    const projectRoot = this.projectRoot
    const compilerVersion = this.compilerVersion

    if (!compilerVersion) {
      notification.error('Build Failed', `Does not have Conflux Truffle installed.`)
      throw new Error('Does not have Conflux Truffle installed.')
    }

    const allVersions = await this.cfxtruffle.versions()
    if (!allVersions.find(v => v.Tag === compilerVersion)) {
      notification.error(`Conflux Truffle ${compilerVersion} not Installed`, `Please install the version in <b>Conflux Truffle Manager</b> or select another version at the bottom bar.`)
      throw new Error('Version not installed')
    }

    this._button.setState({ building: true })
    this.notification = notification.info(`Building Project`, `Building...`, 0)

    const cmd = this.generateBuildCmd({ projectRoot, compilerVersion })
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

  generateBuildCmd({ projectRoot, compilerVersion }) {
    const { base: name } = fileOps.current.path.parse(projectRoot)
    const projectDir = fileOps.current.getDockerMountPath(projectRoot)
    return [
      `docker run -t --rm --name truffle-compile`,
      '-v /var/run/docker.sock:/var/run/docker.sock',
      `-v "${projectDir}:${projectDir}"`,
      `-w "${projectDir}"`,
      `obsidians/conflux-truffle:${compilerVersion}`,
      `cfxtruffle compile`,
    ].join(' ')
  }
}

export default new Compiler()