import React, { Component } from 'react'
import classnames from 'classnames'

import {
  UncontrolledButtonDropdown,
  ToolbarButton,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormGroup,
  Label,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { signatureProvider } from '@obsidians/conflux-sdk'
import { KeypairSelector } from '@obsidians/keypair'
import queue from '@obsidians/conflux-queue'

import { Account, util } from 'js-conflux-sdk'
import Highlight from 'react-highlight'

import DropdownCard from './DropdownCard'
import ContractForm, { ActionParamInput } from './ContractForm'

export default class ContractActions extends Component {
  state = {
    selected: 0,
    value: '',
    signer: '',
    executing: false,
    actionError: '',
    actionResult: '',
  }

  constructor (props) {
    super(props)
  }

  selectAction (index) {
    this.setState({
      selected: index,
      value: '',
      executing: false,
      actionError: '',
      actionResult: '',
    })
  }

  executeAction = async actionName => {
    if (this.state.executing) {
      return
    }

    if (!this.state.signer) {
      notification.error('Error', 'No signer is provided.')
      return
    }
    
    let parameters = { array: [], obj: {} }
    try {
      parameters = this.form.getParameters()
    } catch (e) {
      notification.error('Error in Parameters', e.message)
      return
    }

    this.setState({ executing: true, actionError: '', actionResult: '' })
    // this.notification = notification.info(`Waiting`, `Waiting for transaction confirmation...`, 0)

    const signer = new Account(this.state.signer, signatureProvider)
    
    let result = {}
    const value = util.unit.fromCFXToDrip(this.state.value || 0)
    const gas = this.state.gas || 1000000
    const gasPrice = this.state.gasPrice || 100
    try {
      await queue.add(
        () => this.props.contract[actionName]
          .call(...parameters.array)
          .sendTransaction({ from: signer, value, gas, gasPrice }),
        {
          contractAddress: this.props.contract.address,
          name: actionName,
          functionName: actionName,
          signer: signer.address,
          params: parameters.obj,
          value, gas, gasPrice,
        }
      )
    } catch (e) {
      notification.error('Error', e.message)
      this.setState({ executing: false, actionError: e.message, actionResult: '' })
      return
    }

    // notification.success('Success', 'Transaction is confirmed.')
    this.setState({
      executing: false,
      actionError: '',
      actionResult: JSON.stringify(result, null, 2)
    })
  }

  renderActionSelector = () => {
    const actions = this.props.abi
    const selectedAction = actions[this.state.selected] || {}

    return (
      <React.Fragment>
        <UncontrolledButtonDropdown size='sm'>
          <DropdownToggle color='primary' caret className='rounded-0 border-0 px-2 border-right-1'>
            <i className='fas fa-function' />
            <code className='mx-1'><b>{selectedAction.name}</b></code>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>write functions</DropdownItem>
            {actions.map((item, index) => (
              <DropdownItem
                key={item.name}
                className={classnames({ active: index === this.state.selected })}
                onClick={() => this.selectAction(index)}
              >
                <code>{item.name}</code>
              </DropdownItem>
            ))}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
        <ToolbarButton
          id='contract-execute'
          icon={this.state.executing ? 'fas fa-spin fa-spinner' : 'fas fa-play'}
          tooltip='Execute'
          className='border-right-1'
          onClick={() => this.executeAction(selectedAction.name)}
        />
      </React.Fragment>
    )
  }

  renderResult = () => {
    const { actionError, actionResult } = this.state
    if (actionError) {
      return (
        <div>
          <span className='user-select'>{actionError}</span>
        </div>
      )
    }
    
    if (actionResult) {
      return (
        <Highlight
          language='javascript'
          className='pre-box bg2 pre-wrap break-all small user-select'
          element='pre'
        >
          <code>{actionResult}</code>
        </Highlight>
      )
    }

    return <div className='small'>(None)</div>
  }

  render () {
    const actions = this.props.abi
    const selectedAction = actions[this.state.selected] || {}

    return (
      <div className='d-flex flex-column align-items-stretch h-100'>
        <div className='d-flex border-bottom-1'>
          {this.renderActionSelector()}
        </div>
        <div className='d-flex flex-column flex-grow-1 overflow-auto'>
          <DropdownCard
            isOpen
            title='Parameters'
          >
            <ContractForm
              ref={form => { this.form = form }}
              size='sm'
              {...selectedAction}
              Empty={<div className='small'>(None)</div>}
            />
            {
              (selectedAction.payable || selectedAction.stateMutability === 'payable') ?
              <FormGroup className='mb-2'>
                <Label className='mb-1 small font-weight-bold'>CFX to Transfer</Label>
                <ActionParamInput
                  size='sm'
                  type='name'
                  placeholder={`Default: 0`}
                  value={this.state.value}
                  onChange={value => this.setState({ value })}
                >
                  <span><i className='fas fa-coins' /></span>
                </ActionParamInput>
              </FormGroup> : null
            }
          </DropdownCard>
          <DropdownCard
            isOpen
            title='Gas'
          >
            <FormGroup className='mb-2'>
              <Label className='mb-1 small font-weight-bold'>Gas Limit</Label>
              <ActionParamInput
                size='sm'
                placeholder={`Default: 1,000,000`}
                value={this.state.gas}
                onChange={gas => this.setState({ gas })}
              >
                <span><i className='fas fa-burn' /></span>
              </ActionParamInput>
            </FormGroup>
            <FormGroup className='mb-2'>
              <Label className='mb-1 small font-weight-bold'>Gas Price</Label>
              <ActionParamInput
                size='sm'
                placeholder={`Default: 100 drip`}
                value={this.state.gasPrice}
                onChange={gasPrice => this.setState({ gasPrice })}
              >
                <span><i className='fas fa-dollar-sign' /></span>
              </ActionParamInput>
            </FormGroup>
          </DropdownCard>
          <DropdownCard
            isOpen
            title='Authorization'
            overflow
          >
            <KeypairSelector
              size='sm'
              label='Signer'
              value={this.state.signer}
              onChange={signer => this.setState({ signer })}
            />
          </DropdownCard>
        </div>
      </div>
    )
  }
}
