import React, { PureComponent } from 'react'

import {
  Modal,
  ButtonOptions,
  Table,
  TableCardRow,
} from '@obsidians/ui-components'

export default class TransactionModal extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selected: 'basic',
      tx: {},
    }
    this.modal = React.createRef()
  }

  open = tx => {
    this.setState({ tx, selected: 'basic' })
    this.forceUpdate()
    this.modal.current.openModal()
  }

  renderContent = (tx, selected) => {
    const { data, status } = tx
    const { txHash, contractAddress, name, signer, params, value, tx: txObject, receipt } = data || {}
    if (selected === 'basic') {
      return (
        <Table>
          <TableCardRow
            name='Hash'
            icon='fas fa-hashtag'
            badge={txHash}
          />
          <TableCardRow
            name='Status'
            icon='fad fa-spinner-third'
            badge={status || 'CONFIRMED'}
            badgeColor={status === 'FAILED' ? 'danger' : !status ? 'success' : 'warning'}
          />
          <TableCardRow
            name='Contract'
            icon='fas fa-file-invoice'
            badge={contractAddress}
          />
          <TableCardRow
            name='Function'
            icon='fas fa-function'
            badge={name}
          />
          <TableCardRow
            name='CFX Transfered'
            icon='fas fa-coins'
            badge={value}
          />
          <TableCardRow
            name='Signer'
            icon='fas fa-key'
            badge={signer}
          />
        </Table>
      )
    } else if (selected === 'params') {
      return <pre className='pre-box bg2 small'>{JSON.stringify(params, null, 2)}</pre>
    } else if (selected === 'tx') {
      return <pre className='pre-box bg2 small'>{JSON.stringify(txObject, null, 2)}</pre>
    } else if (selected === 'receipt') {
      return <pre className='pre-box bg2 small'>{JSON.stringify(receipt, null, 2)}</pre>
    }
  }

  render () {
    const { tx, selected } = this.state
    const { data } = tx

    const options = [
      { key: 'basic', text: 'Basic' },
      { key: 'params', text: 'Parameters' },
    ]
    if (data && data.tx) {
      options.push({ key: 'tx', text: 'Tx' })
    }
    if (data && data.receipt) {
      options.push({ key: 'receipt', text: 'Receipt' })
    }

    return (
      <Modal
        ref={this.modal}
        title='Transaction'
      >
        <div>
          <ButtonOptions
            size='sm'
            className='mb-2'
            options={options}
            selected={selected}
            onSelect={selected => this.setState({ selected })}
          />
        </div>
        {this.renderContent(tx, selected)}
      </Modal>
    )
  }
}
