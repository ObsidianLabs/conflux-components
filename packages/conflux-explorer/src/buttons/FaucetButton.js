import React, { PureComponent } from 'react'

import {
  Modal,
  ToolbarButton,
} from '@obsidians/ui-components'

export default class FaucetButton extends PureComponent {
  constructor(props) {
    super(props)

    this.modal = React.createRef()
  }

  openModal = () => {
    this.modal.current.openModal()
  }

  render () {
    return (
      <React.Fragment>
        <ToolbarButton
          id='navbar-faucet'
          size='md'
          icon='fas fa-faucet'
          tooltip='Faucet'
          onClick={this.openModal}
        />
        <Modal
          ref={this.modal}
          overflow
          title='Faucet'
        >
          <div className='bg-light rounded' style={{ height: 500 }}>
            <webview
              ref={this.webview}
              className='w-100 h-100 border-0 m-3'
              style={{ top: 0 }}
              src='https://bank.testnet.algorand.network'
            />
          </div>
        </Modal>
      </React.Fragment>
    )
  }
}
