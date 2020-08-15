import React, { PureComponent } from 'react'

import {
  Button,
  Modal,
  FormGroup,
  Label,
  DebouncedFormGroup,
  CustomInput,
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
      addr: '',
      creating: false,
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = async () => {
    const keypairs = await keypairManager.loadAllKeypairs()
    this.setState({ keypairs })
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

    const genesis_secrets = (await Promise.all(this.state.keypairs.map(k => keypairManager.getSigner(k.address))))
      .map(privateKey => privateKey.substr(2))
      .join('\n') + '\n'
    await instanceChannel.invoke('create', {
      name: this.state.name,
      version: this.state.version,
      chain: this.props.chain,
      genesis_secrets,
    })
    this.modal.current.closeModal()
    this.setState({ creating: false })
    this.props.onRefresh()
  }

  renderGenesisInput = () => {
    if (this.props.chain !== 'dev') {
      return null
    }
    return (
      <FormGroup>
        <Label>Address</Label>
        <CustomInput
          type='select'
          className='form-control'
          // value={this.state.addr}
          // onChange={event => this.setState({ addr: event.target.value })}
        >
          {this.renderAddrOptions()}
        </CustomInput>
      </FormGroup>
    )
  }

  renderAddrOptions = () => {
    if (this.state.loading) {
      return 'Loading'
    }

    if (!this.state.keypairs.length) {
      return <option disabled key='' value=''>(No Conflux keypairs)</option>
    }

    return this.state.keypairs.map(k => <option key={k.address} value={k.address}>{k.address}</option>)
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
        </Modal>
      </React.Fragment>
    )
  }
}
