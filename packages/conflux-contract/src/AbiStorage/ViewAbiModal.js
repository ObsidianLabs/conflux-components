import React, { PureComponent } from 'react'

import {
  Modal,
} from '@obsidians/ui-components'

import Highlight from 'react-highlight'

export default class ViewAbiModal extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()

    this.state = { abi: '' }
  }

  openModal (abi) {
    this.setState({ abi })
    this.modal.current.openModal()
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title='View ABI'
      >
        <Highlight
          language='javascript'
          className='pre-box pre-wrap break-all small'
          element='pre'
        >
          <code>{this.state.abi}</code>
        </Highlight>
      </Modal>
    )
  }
}
