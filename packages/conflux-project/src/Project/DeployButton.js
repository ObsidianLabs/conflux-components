import React, { PureComponent } from 'react'

import {
  Modal,
  Button,
  UncontrolledTooltip,
  FormGroup,
  Label,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { KeypairSelector } from '@obsidians/keypair'

import { ContractForm, ActionParamInput } from '@obsidians/conflux-contract'

import Highlight from 'react-highlight'

import projectManager from '../projectManager'

export default class DeployerButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      constructorAbi: null,
      contractName: '',
      gas: '',
      gasPrice: '',
      signer: '',
      result: '',
    }
    this.parametersModal = React.createRef()
    this.resultModal = React.createRef()

  }

  componentDidMount () {
    projectManager.deployButton = this
  }

  onClick = () => {
    if (this.state.pending) {
      return
    }
    projectManager.deploy()
  }

  getDeploymentParameters = (constructorAbi, contractName, callback) => {
    this.parametersModal.current.openModal()
    this.setState({ constructorAbi, contractName })
    this.callback = callback
  }

  confirmDeploymentParameters = () => {
    let params
    try {
      params = this.form.getValues()
    } catch (e) {
      notification.error('Error', e.message)
      return
    }
    const { signer, gas, gasPrice } = this.state
    this.callback({ params, signer, gas: gas || 1000000, gasPrice: gasPrice || 100 })
  }

  openResultModal = result => {
    this.setState({ result })
    this.parametersModal.current.closeModal()
    this.resultModal.current.openModal()
  }

  renderDeployResult = () => {
    return (
      <Highlight language='javascript' className='pre-box pre-wrap break-all small' element='pre'>
        <code>{JSON.stringify(this.state.result, null, 2)}</code>
      </Highlight>
    )
  }

  render () {
    let icon = <span key='deploy-icon'><i className='fab fa-docker' /></span>
    if (this.state.pending) {
      icon = <span key='deploying-icon'><i className='fas fa-spinner fa-spin' /></span>
    }

    const { constructorAbi } = this.state
    let constructorParameters = null
    if (constructorAbi) {
      constructorParameters = (
        <React.Fragment>
          <Label>Constructor Parameters</Label>
          <ContractForm
            ref={form => { this.form = form }}
            size='sm'
            {...constructorAbi}
            Empty={<div className='small'>(None)</div>}
          />
          <div className='mb-2' />
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <Button
          size='sm'
          color='default'
          id='toolbar-btn-deploy'
          key='toolbar-btn-deploy'
          className='rounded-0 border-0 flex-none px-2 w-5 flex-column align-items-center'
          onClick={this.onClick}
        >
          {icon}
        </Button>
        <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='toolbar-btn-deploy'>
          { this.state.pending ? 'Deploying' : `Deploy`}
        </UncontrolledTooltip>
        <Modal
          ref={this.parametersModal}
          overflow
          title={<span>Deploy Contract <b>{this.state.contractName}</b></span>}
          textConfirm='Deploy'
          onConfirm={this.confirmDeploymentParameters}
        >
          {constructorParameters}
          <KeypairSelector
            label='Signer'
            value={this.state.signer}
            onChange={signer => this.setState({ signer })}
          />
          <div className='row'>
            <FormGroup className='col-6'>
              <Label>Gas Limit</Label>
              <ActionParamInput
                placeholder={`Default: 1,000,000`}
                value={this.state.gas}
                onChange={gas => this.setState({ gas })}
              >
                <span><i className='fas fa-burn' /></span>
              </ActionParamInput>
            </FormGroup>
            <FormGroup className='col-6'>
              <Label>Gas Price</Label>
              <ActionParamInput
                placeholder={`Default: 100 drip`}
                value={this.state.gasPrice}
                onChange={gasPrice => this.setState({ gasPrice })}
              >
                <span><i className='fas fa-dollar-sign' /></span>
              </ActionParamInput>
            </FormGroup>
          </div>
        </Modal>
        <Modal
          ref={this.resultModal}
          title='Deployment Result'
          textCancel='Close'
        >
          Open the deployed <a href={`#/contract/${this.state.result.contractCreated}`}>contract</a>
          {this.renderDeployResult()}
        </Modal>
      </React.Fragment>
    )
  }
}