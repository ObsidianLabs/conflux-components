import React, { PureComponent } from 'react'

import {
  Modal,
  DebouncedFormGroup,
} from '@obsidians/ui-components'


export default class AbiInputModal extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
    this.abiInput = React.createRef()

    this.state = {
      codeHash: '',
      abi: '',
      validJson: false,
    }
  }

  openModal = () => {
    this.modal.current.openModal()
    setTimeout(() => this.abiInput.current.focus(), 100)
    return new Promise(resolve => { this.onResolve = resolve })
  }

  onConfirm = () => {
    this.onResolve({
      codeHash: this.state.codeHash,
      abi: this.state.abi,
    })
    this.setState({ codeHash: '', abi: '', validJson: false })
    this.modal.current.closeModal()
  }

  onChange = abi => {
    try {
      JSON.parse(abi)
    } catch (e) {
      this.setState({ abi, validJson: false })
      return
    }
    this.setState({ abi, validJson: true })
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        h100
        title='Enter New ABI'
        onConfirm={this.onConfirm}
        confirmDisabled={!this.state.codeHash || !this.state.validJson}
      >
        <DebouncedFormGroup
          label='Code hash'
          value={this.state.codeHash}
          onChange={codeHash => this.setState({ codeHash })}
        />
        <DebouncedFormGroup
          ref={this.abiInput}
          size='sm'
          label='ABI'
          type='textarea'
          placeholder='Please enter the ABI object. Must be a valid JSON array.'
          formGroupClassName='d-flex flex-column flex-grow-1 code'
          inputGroupClassName='flex-grow-1'
          className='h-100 code'
          value={this.state.abi}
          onChange={this.onChange}
        />
      </Modal>
    )
  }
}
