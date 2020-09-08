import React, { PureComponent } from 'react'

import {
  Button,
  Modal,
  DebouncedFormGroup,
  DropdownInput,
  Badge,
} from '@obsidians/ui-components'

import keypairManager from '@obsidians/keypair'
import { DockerImageInputSelector } from '@obsidians/docker'
import notification from '@obsidians/notification'

import instanceChannel from './instanceChannel'

export default class CreateInstanceButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      version: '',
      keypairs: [],
      miner: '',
      creating: false,
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = async () => {
    const keypairs = await keypairManager.loadAllKeypairs()
    this.setState({
      keypairs,
      miner: keypairs[0] ? keypairs[0].address : '',
    })
  }

  onClickButton = () => {
    this.refresh()
    this.modal.current.openModal()
  }

  onCreateInstance = async () => {
    if (!this.state.keypairs || !this.state.keypairs.length) {
      notification.error('Failed', 'Please create or import a keypair in the keypair manager first.')
      return
    }

    this.setState({ creating: 'Creating...' })

    const genesis_secrets = await Promise.all(this.state.keypairs.map(k => keypairManager.getSigner(k.address)))
    await instanceChannel.invoke('create', {
      name: this.state.name,
      version: this.state.version,
      chain: this.props.chain,
      miner: this.state.miner,
      genesis_secrets,
    })
    this.modal.current.closeModal()
    this.setState({ creating: false })
    this.props.onRefresh()
  }

  renderMinerInput = () => {
    if (this.props.chain !== 'dev') {
      return null
    }
    return (
      <DropdownInput
        label='Miner'
        options={this.state.keypairs.map(k => ({
          id: k.address,
          display: (
            <div className='w-100 d-flex align-items-center justify-content-between'>
              <code>{k.address}</code><Badge color='info' style={{ top: 0 }}>{k.name}</Badge>
            </div>
          )
        }))}
        renderText={option => <div className='w-100 mr-1'>{option.display}</div>}
        placeholder='(No Conflux keypairs)'
        value={this.state.miner}
        onChange={miner => this.setState({ miner })}
      />
    )
  }

  render () {
    return (
      <React.Fragment>
        <Button
          key='new-instance'
          color='success'
          className={this.props.className}
          onClick={this.onClickButton}
        >
          <i className='fas fa-plus mr-1' />
          New Instance
        </Button>
        <Modal
          ref={this.modal}
          overflow
          title={`New Instance (${this.props.chain})`}
          textConfirm='Create'
          onConfirm={this.onCreateInstance}
          pending={this.state.creating}
          confirmDisabled={!this.state.name || !this.state.version}
        >
          <DebouncedFormGroup
            label='Instance name'
            placeholder='Can only contain alphanumeric characters, dots, hyphens or underscores.'
            maxLength='50'
            value={this.state.name}
            onChange={name => this.setState({ name })}
          />
          <DockerImageInputSelector
            channel={instanceChannel.node}
            label='Conflux version'
            noneName='Conflux node'
            modalTitle='Conflux Version Manager'
            downloadingTitle='Downloading Conflux'
            selected={this.state.version}
            onSelected={version => this.setState({ version })}
          />
          {this.renderMinerInput()}
        </Modal>
      </React.Fragment>
    )
  }
}
