import React, { PureComponent } from 'react'

import {
  Screen,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/conflux-node'

import AccountBalance from './AccountBalance'
import AccountTransactions from './AccountTransactions'

export default class AccountPage extends PureComponent {
  state = {
    error: null,
    account: null,
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
    const value = this.props.value

    if (!value) {
      this.setState({ error: null, account: null })
      return
    }

    if (!nodeManager.sdk.isValidAddress(value)) {
      this.setState({ error: true, account: null })
      return
    }

    let account
    try {
      account = await nodeManager.sdk.accountFrom(value)
      this.setState({ error: null, account })
      this.forceUpdate()
    } catch (e) {
      this.setState({ error: e.message, account: null })
      return
    }
  }

  render () {
    const { error, account } = this.state

    if (!this.props.value) {
      return (
        <Screen>
          <h4 className='display-4'>New Page</h4>
          <p className='lead'>Please enter an Conflux address.</p>
        </Screen>
      )
    }

    if (error) {
      return (
        <Screen>
          <h4 className='display-4'>Invalid Address</h4>
          <p>{error}</p>
          <p className='lead'><kbd>{this.props.value}</kbd></p>
        </Screen>
      )
    }

    if (!account) {
      return null
    }

    return (
      <div className='d-flex flex-1 flex-column overflow-auto'>
        <div className='d-flex'>
          <div className='col-4 p-0 border-right-black'>
            <AccountBalance account={account} />
          </div>
          <div className='col-8 p-0 overflow-auto' style={{ maxHeight: 250 }}>
          </div>
        </div>
        <div className='d-flex flex-fill overflow-hidden'>
          <div className='col-12 p-0 border-top-black overflow-auto'>
            <AccountTransactions account={account} />
          </div>
        </div>
      </div>
    )
  }
}
