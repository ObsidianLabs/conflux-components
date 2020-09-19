import React, { PureComponent } from 'react'

import {
  Modal,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from '@obsidians/ui-components'

import queue from './queue'
import QueueItem from './QueueItem'

import TransactionModal from './TransactionModal'

export default class QueueButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      data: null,
    }
    queue.button = this

    this.txModal = React.createRef()
    this.allTxsModal = React.createRef()
  }

  openAllTransactionsModal = data => {
    this.allTxsModal.current.openModal()
  }

  openTransaction = tx => {
    this.txModal.current.open(tx)
  }

  render () {
    let icon = null
    if (queue.pending.length) {
      icon = <div key='icon-peinding' className='d-inline-block w-3 mr-1'><i className='fas fa-spin fa-spinner' /></div>
    } else {
      icon = <div key='icon-no-pending' className='d-inline-block w-3 mr-1'><i className='fas fa-receipt' /></div>
    }

    const pendingItems = queue.pending.map((item, index) => (
      <DropdownItem
        key={`pending-${index}`}
        className='d-flex align-items-center'
        onClick={() => this.openTransaction(item)}
      >
        <QueueItem {...item} />
      </DropdownItem>
    ))
    if (pendingItems.length) {
      pendingItems.push(<DropdownItem divider />)
      pendingItems.unshift(
        <DropdownItem header key='header-pending'>
          <i className='fas fa-spin fa-spinner mr-1' />Pending
        </DropdownItem>
      )
    }

    const txsItems = (this.props.txs?.toJS() || []).map((item, index) => (
      <DropdownItem key={`tx-${index}`} onClick={() => this.openTransaction(item)}>
        <QueueItem {...item} />
      </DropdownItem>
    ))
    if (!txsItems.length) {
      txsItems.push(<DropdownItem disabled>(None)</DropdownItem>)
    }
    // txsItems.push(<DropdownItem divider />)
    txsItems.unshift(
      <DropdownItem header key='header-txs'>
        <i className='far fa-history mr-1' />Recent Transactions
      </DropdownItem>
    )

    return (
      <React.Fragment>
        <UncontrolledButtonDropdown direction='up'>
          <DropdownToggle size='sm' color='default' className='rounded-0 px-2 text-muted'>
            {icon}Transactions
          </DropdownToggle>
          <DropdownMenu right className='dropdown-menu-sm'>
            {pendingItems}
            {txsItems}
            {/* <DropdownItem onClick={this.openAllTransactionsModal}>
              <div className='d-inline-block w-3'><i className='fal fa-clipboard-list-check' /></div>
              All Transactions...
            </DropdownItem> */}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
        <TransactionModal ref={this.txModal} />
        <Modal
          ref={this.allTxsModal}
          title='All Transactions'
        >
        </Modal>
      </React.Fragment>
    )
  }
}
