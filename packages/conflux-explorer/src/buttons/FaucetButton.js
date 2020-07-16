import React, { PureComponent } from 'react'

import {
  ToolbarButton,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

export default class FaucetButton extends PureComponent {
  claim = async () => {
    this.notification = notification.info('Claiming', `Trying to claim free tokens for <b>${this.props.address}</b>`, 0)
    let result
    try {
      const res = await fetch(`https://wallet.confluxscan.io/faucet/dev/ask?address=${this.props.address}`)
      result = await res.json()
    } catch (e) {}
    this.notification.dismiss()
    if (!result) {
      notification.error('Failed', 'Unknown error')
      return
    }
    if (result.code) {
      notification.error('Failed', result.message)
    } else {
      notification.success('Success', `Claimed 100 CFX for <b>${this.props.address}</b>`)
    }
  }

  render () {
    return (
      <ToolbarButton
        id='navbar-faucet'
        size='md'
        icon='fas fa-faucet'
        tooltip='Faucet'
        onClick={this.claim}
      />
    )
  }
}
