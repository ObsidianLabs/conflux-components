import React, { Component } from 'react'
import classnames from 'classnames'

import {
  UncontrolledButtonDropdown,
  ToolbarButton,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
} from '@obsidians/ui-components'

import DropdownCard from './DropdownCard'
import ActionForm from './ActionForm'

export default class ContractTable extends Component {
  state = {
    selected: 0,
    executing: false,
    actionError: '',
    actionResult: '',
  }

  selectAction (index) {
    this.setState({
      selected: index,
      executing: false,
      actionError: '',
      actionResult: '',
    })
  }

  executeAction = async actionName => {
    if (this.state.executing) {
      return
    }
    const values = this.form.getValues()

    this.setState({ executing: true, actionError: '', actionResult: '' })

    let result
    try {
      result = await this.props.contract[actionName].call(...values)
    } catch (e) {
      console.warn(e)
      // if (!this.state.executing) {
      //   return
      // }
      this.setState({ executing: false, actionError: e.message, actionResult: '' })
      return
    }

    // if (!this.state.executing) {
    //   return
    // }
    this.setState({
      executing: false,
      actionError: '',
      actionResult: result.toString()
    })
  }

  renderTableSelector = () => {
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
            <DropdownItem header>events</DropdownItem>
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
        <div>
          <span>{actionResult}</span>
        </div>
      )
    }

    return <div className='small'>(None)</div>
  }

  render () {
    const actions = this.props.abi

    if (!actions || !actions.length) {
      return null
    }
    
    const selectedAction = actions[this.state.selected] || {}

    return (
      <div className='d-flex flex-column align-items-stretch h-100'>
        <div className='d-flex border-bottom-1'>
          {this.renderTableSelector()}
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
          <ActionForm
            ref={form => { this.form = form }}
            action={selectedAction}
            fields={selectedAction.inputs}
            Empty={<div className='small'>(None)</div>}
          />
        </DropdownCard>
        <DropdownCard
          isOpen
          title='Result'
          flex='1 2 auto'
          minHeight='120px'
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
  }
}
