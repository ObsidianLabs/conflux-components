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

import instanceChannel from './instanceChannel'

export default class CreateInstanceButton extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      versions: [],
      keypairs: [],
      name: '',
      selected: '',
      addr: '',
      creating: false,
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    this.refresh()
  }

  refresh = async () => {
    this.setState({ loading: true })
    const versions = await instanceChannel.invoke('versions')
    const keypairs = await keypairManager.loadAllKeypairs()
    this.setState({
      versions,
      loading: false,
      keypairs,
      selected: versions[0] ? versions[0].Tag : '',
      genesis: keypairs,
    })
  }

  onClickButton = () => {
    this.refresh()
    this.modal.current.openModal()
  }

  onCreateInstance = async () => {
    this.setState({ creating: 'Creating...' })

    const genesis_secrets = (await Promise.all(this.state.genesis.map(k => keypairManager.getSigner(k.address))))
      .map(privateKey => privateKey.substr(2))
      .join('\n') + '\n'
    await instanceChannel.invoke('create', {
      name: this.state.name,
      version: this.state.selected,
      chain: this.props.chain,
      genesis_secrets,
    })
    this.modal.current.closeModal()
    this.setState({ creating: false })
    this.props.onRefresh()
  }

  renderVersionOptions = () => {
    if (this.state.loading) {
      return 'Loading'
    }

    if (!this.state.versions.length) {
      return <option disabled key='' value=''>(No Conflux installed)</option>
    }

    return this.state.versions.map(v => <option key={v.Tag} value={v.Tag}>{v.Tag}</option>)
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
          title={`New Instance (${this.props.chain})`}
          textConfirm='Create'
          onConfirm={this.onCreateInstance}
          pending={this.state.creating}
          confirmDisabled={!this.state.name || !this.state.selected}
        >
          <DebouncedFormGroup
            label='Instance name'
            placeholder='Can only contain alphanumeric characters, dots, hyphens or underscores.'
            maxLength='50'
            value={this.state.name}
            onChange={name => this.setState({ name })}
          />
          <FormGroup>
            <Label>Conflux version</Label>
            <CustomInput
              type='select'
              className='form-control'
              value={this.state.selected}
              onChange={event => this.setState({ selected: event.target.value })}
            >
              {this.renderVersionOptions()}
            </CustomInput>
          </FormGroup>
        </Modal>
      </React.Fragment>
    )
  }
}
