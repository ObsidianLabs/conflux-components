import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import nodeManager from '@obsidians/conflux-node'
import compilerManager from '@obsidians/conflux-compiler'

import moment from 'moment'

class ProjectManager {
  constructor () {
    this.project = null
    this.modal = null
    this.button = null
  }
  
  set terminalButton (button) {
    this.button = button
  }

  get projectRoot () {
    return this.project.props.projectRoot
  }

  get compilerVersion () {
    return this.project.props.compilerVersion
  }

  get selectedAccount () {
    const { accounts, network } = redux.getState()
    return accounts.getIn([network, 'selected']) || ''
  }

  openProjectSettings () {
    if (this.project) {
      this.project.openProjectSettings()
    }
  }

  async checkSettings () {
    if (!this.project) {
      return
    }

    // notification.info('Not in Code Editor', 'Please switch to code editor and build.')
    // return

    const projectRoot = this.projectRoot
    if (!projectRoot) {
      notification.error('No Project', 'Please open a project first.')
      return
    }

    const settings = await this.project.projectSettings.readSettings()
    return settings
  }

  async compile () {
    await this.project.saveAll()
    this.toggleTerminal(true)

    try {
      await compilerManager.build()
    } catch (e) {
      console.warn(e)
      return false
    }

    return true
  }

  async readContractJson () {
    const settings = await this.checkSettings()
    if (!settings || !settings.deploy) {
      throw new Error('Please set the smart contract to deploy in project settings.')
    }

    const { path } = fileOps.current
    const contractJsonPath = path.join(this.projectRoot, settings.deploy)
    const contractJson = await fileOps.current.readFile(contractJsonPath)

    let contractObj
    try {
      contractObj = JSON.parse(contractJson)
    } catch (e) {
      throw new Error(`Error in reading <b>${contractJsonPath}</b>`)
    }
    return contractObj
  }

  async deploy () {
    if (!nodeManager.sdk) {
      throw new Error('No running node. Please start one first.')
    }

    if (!this.selectedAccount) {
      throw new Error('No selected account. Please select one in the <b>Explorer</b> tab.')
    }

    const settings = await this.checkSettings()
    if (!settings || !settings.deploy) {
      throw new Error('Please set the smart contract to deploy in project settings.')
    }

    const contractObj = await this.readContractJson()

    let result
    try {
      result = await nodeManager.sdk.deploy(contractObj, this.selectedAccount)
    } catch (e) {
      throw e
    }

    const { path } = fileOps.current
    const contractName = path.parse(settings.main).base

    redux.dispatch('ABI_ADD', {
      name: contractName,
      codeHash: result.codeHash,
      abi: JSON.stringify(contractObj.abi),
    })

    const deployResultPath = path.join(this.projectRoot, 'deploys', `${result.network}_${moment().format('YYYYMMDD_HHmmss')}.json`)
    await fileOps.current.ensureFile(deployResultPath)
    await fileOps.current.writeFile(deployResultPath, JSON.stringify(result, null, 2))

    return result
  }

  toggleTerminal (terminal) {
    if (this.button) {
      this.button.setState({ terminal })
    }
    if (this.project) {
      this.project.toggleTerminal(terminal)
    }
  }
}

export default new ProjectManager()