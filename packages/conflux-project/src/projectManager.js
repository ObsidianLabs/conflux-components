import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import redux from '@obsidians/redux'
import nodeManager from '@obsidians/conflux-node'
import compilerManager from '@obsidians/conflux-compiler'
import { signatureProvider } from '@obsidians/conflux-sdk'
import queue from '@obsidians/conflux-queue'
import { Account, util } from 'js-conflux-sdk'

import moment from 'moment'

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

  openProjectSettings () {
    if (this.project) {
      this.project.openProjectSettings()
    }
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
      parameters => this.pushDeployment(contractObj, parameters)
    )
  }

  async pushDeployment (contractObj, parameters) {
    if (!nodeManager.sdk) {
      notification.error('Error', 'No running node. Please start one first.')
      return
    }

    if (!parameters.signer) {
      notification.error('Error', 'No signer specified. Please select one to sign the deployment transaction.')
      return
    }

    const contractName = contractObj.contractName
    const deploying = notification.info(`Deploying...`, `Deploying contract <b>${contractName}</b>...`, 0)
    this.deployButton.setState({ pending: true, result: '' })

    const networkId = nodeManager.sdk.networkId
    const signer = new Account(parameters.signer, signatureProvider)
    const contractInstance = nodeManager.sdk.contractFrom(contractObj)
    const { params, gas, gasPrice } = parameters
    const codeHash = util.sign.sha3(Buffer.from(contractObj.deployedBytecode.replace('0x', ''), 'hex')).toString('hex')

    let result
    try {
      result = await new Promise((resolve, reject) => {
        queue.add(
          () => contractInstance.constructor
            .call(...params)
            .sendTransaction({ from: signer, gas, gasPrice }),
          {
            name: 'Deploy',
            contractName,
            signer: signer.address,
            abi: contractObj.abi,
            params, gas, gasPrice,
            modalWhenExecuted: true,
          },
          {
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
            },
            failed: reject,
          }
        ).catch(reject)
      })
    } catch (e) {
      deploying.dismiss()
      notification.error('Deploy Failed', e.message)
      this.deployButton.setState({ pending: false })
      return
    }

    deploying.dismiss()
    this.deployButton.setState({ pending: false })
    notification.success('Deploy Successful')
    this.deployButton.closeParametersModal(result)

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