import React, { PureComponent } from 'react'

import {
  Screen,
  SplitPane,
  LoadingScreen,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/conflux-node'
import { projectManager } from '@obsidians/conflux-project'

import ContractActions from './ContractActions'
import ContractTable from './ContractTable'

export default class ContractPage extends PureComponent {
  state = {
    error: null,
    abi: null,
    loading: false,
  }

  componentDidMount () {
    this.refresh()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.value !== this.props.value) {
      this.refresh()
    }
  }

  refresh = async () => {
    this.setState({ loading: true })
    
    const value = this.props.value

    if (!value) {
      this.setState({ error: null })
      return
    }

    try {
      const contract = await projectManager.readContractJson()
      this.setState({
        loading: false,
        abi: contract.abi
      })
    } catch (e) {
      this.setState({ loading: false, error: e.message })
    }
  }

  render () {
    const { error, abi } = this.state

    if (!this.props.value) {
      return (
        <Screen>
          <h4 className='display-4'>New Page</h4>
          <p className='lead'>Please enter an Conflux address.</p>
        </Screen>
      )
    }

    if (this.state.loading || !abi) {
      return <LoadingScreen />
    }

    if (error) {
      return (
        <Screen>
          <h4 className='display-4'>Error</h4>
          <p>{error}</p>
        </Screen>
      )
    }

    const contractInstance = nodeManager.sdk.contractFrom(abi, this.props.value)
    const functions = abi.filter(item => item.type === 'function')
    // window.contract = contractInstance
    
    return (
      <div className='d-flex p-relative h-100'>
        <SplitPane
          split='vertical'
          defaultSize={480}
          minSize={200}
        >
          <ContractActions
            // network={network}
            value={this.props.value}
            abi={functions.filter(item => item.stateMutability !== 'view')}
            contract={contractInstance}
            // contract={contract}
            // abi={this.state.abi}
            // history={contractCalls.getIn(['action', 'history'])}
            // bookmarks={contractCalls.getIn(['action', 'bookmarks'])}
          />
          <ContractTable
            value={this.props.value}
            abi={functions.filter(item => item.stateMutability === 'view')}
            contract={contractInstance}
            // network={network}
            // contract={contract}
            // abi={this.state.abi}
            // history={contractCalls.getIn(['table', 'history'])}
            // bookmarks={contractCalls.getIn(['table', 'bookmarks'])}
          />
        </SplitPane>
      </div>
    )
  }
}
