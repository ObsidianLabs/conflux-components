import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import { networkManager } from '@obsidians/conflux-network'
import compilerManager from '@obsidians/conflux-compiler'
import { signatureProvider } from '@obsidians/conflux-sdk'
import queue from '@obsidians/conflux-queue'
import { Account, util } from 'js-conflux-sdk'

import moment from 'moment'

const regexSolc = /(compilers['"]?\s*:\s*\{[^\}]*solc['"]?\s*:\s*\{[^\}]*version['"]?\s*:\s*['"])(.*)(['"])/

class ProjectManager {
  constructor () {
    this.project = null
    this.terminalButton = null
    this.deployButton = null
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

  projectFilePath (relativePath) {
    return fileOps.current.path.join(this.projectRoot, relativePath)
  }

  openProjectSettings () {
    if (this.project) {
      this.project.openProjectSettings()
    }
  }

  async readTruffleConfig () {
    return await fileOps.current.readFile(this.projectFilePath('truffle-config.js'))
  }

  async writeTruffleConfig (content) {
    await fileOps.current.writeFile(this.projectFilePath('truffle-config.js'), content)
  }

  async getSolcVersionAndUpdate () {
    const truffleConfig = await this.readTruffleConfig()
    const match = truffleConfig.match(regexSolc)
    if (match && match[2]) {
      redux.dispatch('UPDATE_GLOBAL_CONFIG', { solc: match[2] })
      return
    }

    notification.error('Unable to get solc version', 'Unable to find solc version. Please check the file <b>truffle-config.js</b>, and make sure to set the <b>compilers.solc.version</b> field.')
    redux.dispatch('UPDATE_GLOBAL_CONFIG', { solc: '' })
  }

  async updateSolcVersion (version) {
    if (!this.project?.props?.projectRoot) {
      return false
    }

    const truffleConfig = await this.readTruffleConfig()
    const match = truffleConfig.match(regexSolc)
    if (!match || !match[2]) {
      notification.error('Unable to get solc version', 'Unable to find solc version. Please check the file <b>truffle-config.js</b>, and make sure to set the <b>compilers.solc.version</b> field.')
      return false
    }

    const updated = truffleConfig.replace(regexSolc, `$1${version}$3`)
    await this.writeTruffleConfig(updated)
    return true
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

  async readContractJson (contractPath) {
    let contractJson
    if (contractPath) {
      contractJson = await fileOps.current.readFile(contractPath)
    } else {
      const settings = await this.checkSettings()
      if (!settings || !settings.deploy) {
        throw new Error('Please set the smart contract to deploy in project settings.')
      }
      const { path } = fileOps.current
      contractPath = path.join(this.projectRoot, settings.deploy)
      contractJson = await fileOps.current.readFile(contractPath)
    }

    try {
      return JSON.parse(contractJson)
    } catch (e) {
      throw new Error(`Error in reading <b>${contractPath}</b>. Not a valid JSON file.`)
    }
  }

  getConstructorAbi (contractObj) {
    if (!contractObj.abi) {
      throw new Error(`Error in reading the ABI. Does not have the field abi.`)
    }
    if (!Array.isArray(contractObj.abi)) {
      throw new Error(`Error in reading the ABI. Field abi is not an array.`)
    }
    const constructorAbi = contractObj.abi.find(item => item.type === 'constructor')
    return constructorAbi
  }

  async deploy (contractPath) {
    let contractObj
    try {
      contractObj = await this.readContractJson(contractPath)
    } catch (e) {
      notification.error('Error', e.message)
      return
    }

    let constructorAbi
    try {
      constructorAbi = await this.getConstructorAbi(contractObj)
    } catch (e) {
      notification.error('Error', e.message)
      return
    }

    this.deployButton.getDeploymentParameters(constructorAbi, contractObj.contractName, 
      allParameters => this.pushDeployment(contractObj, allParameters)
    )
  }

  async pushDeployment (contractObj, allParameters) {
    if (!networkManager.sdk) {
      notification.error('Error', 'No running node. Please start one first.')
      return
    }

    if (!allParameters.signer) {
      notification.error('Error', 'No signer specified. Please select one to sign the deployment transaction.')
      return
    }

    const contractName = contractObj.contractName
    this.deployButton.setState({ pending: true, result: '' })

    const networkId = networkManager.sdk.networkId
    const signer = new Account(allParameters.signer, signatureProvider)
    const contractInstance = networkManager.sdk.contractFrom(contractObj)
    const { parameters, gas, gasPrice } = allParameters
    const codeHash = util.sign.sha3(Buffer.from(contractObj.deployedBytecode.replace('0x', ''), 'hex')).toString('hex')

    let result
    try {
      result = await new Promise((resolve, reject) => {
        queue.add(
          () => contractInstance.constructor
            .call(...parameters.array)
            .sendTransaction({ from: signer, gas, gasPrice }),
          {
            name: 'Deploy',
            contractName,
            signer: signer.address,
            abi: contractObj.abi,
            params: parameters.obj,
            gas, gasPrice,
            modalWhenExecuted: true,
          },
          {
            pushing: () => this.deployButton.closeParametersModal(),
            executed: ({ tx, receipt, abi }) => {
              resolve({
                network: networkId,
                contractCreated: receipt.contractCreated,
                codeHash: `0x${codeHash}`,
                ...parameters,
                tx,
                receipt,
                abi,
              })
              return true
            },
            failed: reject,
          }
        ).catch(reject)
      })
    } catch (e) {
      notification.error('Deploy Failed', e.message)
      this.deployButton.setState({ pending: false })
      return
    }

    this.deployButton.setState({ pending: false })
    notification.success('Deploy Successful')

    redux.dispatch('ABI_ADD', {
      name: contractName,
      codeHash: result.codeHash,
      abi: JSON.stringify(contractObj.abi),
    })

    const deployResultPath = fileOps.current.path.join(this.projectRoot, 'deploys', `${result.network}_${moment().format('YYYYMMDD_HHmmss')}.json`)
    await fileOps.current.ensureFile(deployResultPath)
    await fileOps.current.writeFile(deployResultPath, JSON.stringify(result, null, 2))
  }

  toggleTerminal (terminal) {
    if (this.terminalButton) {
      this.terminalButton.setState({ terminal })
    }
    if (this.project) {
      this.project.toggleTerminal(terminal)
    }
  }
}

export default new ProjectManager()