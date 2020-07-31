import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import nodeManager from './nodeManager'

export default class NodeConfigModal extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
    this.input = React.createRef()

    this.state = {
      miner: '',
      ip: '',
    }
  }

  componentDidMount () {
    nodeManager.configModal = this
  }

  openModal = ({ miner, ip }) => {
    this.setState({ miner: `0x${miner}`, ip })
    this.modal.current.openModal()
    setTimeout(() => this.input.current.focus(), 100)
    return new Promise(resolve => { this.onResolve = resolve })
  }

  onConfirm = async () => {
    this.onResolve({
      miner: this.state.miner,
      ip: this.state.ip,
    })
    this.modal.current.closeModal()
  }

  render () {
    const { miner, ip } = this.state
    return (
      <Modal
        ref={this.modal}
        title='Miner Config'
        onConfirm={this.onConfirm}
        confirmDisabled={!miner || !ip}
        onClosed={() => this.onResolve()}
      >
        <DebouncedFormGroup
          ref={this.input}
          label='Miner address'
          value={miner}
          onChange={miner => this.setState({ miner })}
        />
        <DebouncedFormGroup
          label='Public IP'
          value={ip}
          onChange={ip => this.setState({ ip })}
        />
      </Modal>
    )
  }
}
