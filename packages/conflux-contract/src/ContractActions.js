import React, { Component } from 'react'
import classnames from 'classnames'

import {
  UncontrolledButtonDropdown,
  ToolbarButton,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  FormGroup,
  Label,
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { signatureProvider } from '@obsidians/conflux-sdk'
import { KeypairSelector } from '@obsidians/keypair'

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

    let values
    try {
      values = this.form.getValues()
    } catch (e) {
      notification.error('Error', e.message)
      return
    }

    this.setState({ executing: true, actionError: '', actionResult: '' })
    this.notification = notification.info(`Waiting`, `Waiting for transaction confirmation...`, 0)

    const signer = new Account(this.state.signer, signatureProvider)
    
    let result
    try {
      result = await this.props.contract[actionName]
        .call(...values)
        .sendTransaction({
          from: signer,
          value: util.unit.fromCFXToDrip(this.state.value || 0),
          gas: this.state.gas || 1000000,
          gasPrice: this.state.gasPrice || 100,
        })
        .executed()
    } catch (e) {
      console.warn(e)
      // if (!this.state.executing) {
      //   return
      // }
      setTimeout(() => this.notification.dismiss(), 50)
      notification.error('Error', e.message)
      this.setState({ executing: false, actionError: e.message, actionResult: '' })
      return
    }

    // if (!this.state.executing) {
    //   return
    // }
    this.notification.dismiss()
    notification.success('Success', 'Transaction is confirmed.')
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
          <span>{actionError}</span>
        </div>
      )
    }
    
    if (actionResult) {
      return (
        <Highlight
          language='javascript'
          className='pre-box pre-wrap break-all small user-select'
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
        <DropdownCard
          isOpen
          title='Parameters'
          flex='0 1 auto'
          // right={
          //   <Badge color='primary' onClick={e => {
          //     e.stopPropagation()
          //     e.preventDefault()

          //     const authorization = this.getAuthorization()
          //     const parsedData = this.form.getParsedData()
          //     const raw = api.eosjs.create().txScript(
          //       `${this.props.contract}::${action.name}`,
          //       authorization,
          //       parsedData
          //     )
          //     $.modals.open('rawActionCommand', raw)
          //   }}>
          //     <i className='fas fa-eye mr-1' />
          //     Command
          //   </Badge>
          // }
        >
          <ContractForm
            ref={form => { this.form = form }}
            size='sm'
            {...selectedAction}
            Empty={<div className='small'>(None)</div>}
          />
          {
            selectedAction.payable ?
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
          flex='0 1 auto'
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
        <DropdownCard
          isOpen
          title='Result'
          flex='1 2 auto'
          minHeight='80px'
          right={
            this.state.actionError
              ? <Badge color='danger'>Error</Badge>
              : this.state.actionResult ? <Badge color='success'>Success</Badge> : null
          }
        >
          {this.renderResult()}
        </DropdownCard>
      </div>
    )

    //   <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1, overflow: 'auto', maxHeight: '100%', height: '100%' }}>
    //     <ButtonGroup className='btn-block btn-flat border-bottom-black' style={{ flex: 'none' }}>
    //       {this.renderActionSelector()}

    //       <div className='flex border-left-black' />

    //       <DropdownToggleButton
    //         id='action-bookmark'
    //         Btn={<i className='far fa-heart' />}
    //         Preheader={
    //           <DropdownItem onClick={() => {
    //             $.modals.open('addContractCallToBookmarks', {
    //               network: this.props.network,
    //               contract: this.props.contract,
    //               action,
    //               fields,
    //               data: this.form.getData(),
    //               args: this.form.getValues(),
    //               actor: this.state.actor,
    //               permission: this.state.permission
    //             })
    //           }}>Add to Bookmarks</DropdownItem>
    //         }
    //         header='BOOKMARKS'
    //         list={List(this.props.bookmarks)}
    //         renderItem={BookmarkItem}
    //         onClickItem={BookmarkItem.onClick}
    //         onClickContextMenu={BookmarkItem.onContextMenu}
    //       />
    //       <DropdownToggleButton
    //         id='action-history'
    //         Btn={<i className='far fa-clock' />}
    //         header='HISTORY'
    //         list={this.props.history}
    //         renderItem={HistoryItem}
    //         onClickItem={HistoryItem.onClick}
    //         onClickContextMenu={HistoryItem.onContextMenu}
    //       />
    //     </ButtonGroup>



    //       <DropdownCard
    //         title='Ricardian'
    //         right={action.ricardian_contract ? <span><i className='fas fa-check-circle text-success' /></span> : null}
    //         flex='0 2 auto'
    //         maxHeight='200px'
    //         minHeight={action.ricardian_contract ? '' : '44px'}
    //       >
    //         {this.renderRicardian(action.ricardian_contract)}
    //       </DropdownCard>

    //       <DropdownCard
    //         title='Result'
    //         isOpen
    //         flex='1 2 auto'
    //         minHeight='120px'
    //         right={
    //           this.state.actionError
    //             ? <Badge color='danger'>Error</Badge>
    //             : this.state.actionResult ? <Badge color='success'>Success</Badge> : null
    //         }
    //       >
    //         {this.renderResult()}
    //       </DropdownCard>
    //     {/* </div> */}
    //   </div>
    // )
  }
}
