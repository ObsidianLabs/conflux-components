import React, { PureComponent } from 'react'

import {
  Modal,
  ButtonOptions,
  Table,
  TableCardRow,
} from '@obsidians/ui-components'

import { util } from 'js-conflux-sdk'
import { Link } from 'react-router-dom'
import Highlight from 'react-highlight'

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
    const { txHash, contractAddress, functionName, contractName, signer, params, value, tx: txObject, receipt, abi } = data || {}
    if (selected === 'basic') {
      return (
        <Table>
          <TableCardRow
            name='Hash'
            icon='fas fa-hashtag'
            badge={<code>{txHash}</code>}
          />
          <TableCardRow
            name='Status'
            icon='fad fa-spinner-third'
            badge={status || 'CONFIRMED'}
            badgeColor={status === 'FAILED' ? 'danger' : !status ? 'success' : 'warning'}
          />
          {
            contractAddress &&
            <TableCardRow
              name='Contract'
              icon='fas fa-file-invoice'
              badge={(
                <Link
                  to={`/contract/${contractAddress}`}
                  className='text-body'
                  onClick={() => this.modal.current.closeModal()}
                >
                  <code>{contractAddress}</code>
                </Link>
              )}
            />
          }
          {
            functionName &&
            <TableCardRow
              name='Function'
              icon='fas fa-function'
              badge={functionName}
            />
          }
          {
            contractName &&
            <TableCardRow
              name='Contract Name'
              icon='fas fa-file-invoice'
              badge={contractName}
            />
          }
          {
            value &&
            <TableCardRow
              name='CFX Transfered'
              icon='fas fa-coins'
              badge={`${util.unit.fromDripToCFX(value)} CFX`}
            />
          }
          <TableCardRow
            name='Signer'
            icon='fas fa-key'
            badge={(
              <Link
                to={`/account/${signer}`}
                className='text-body'
                onClick={() => this.modal.current.closeModal()}
              >
                <code>{signer}</code>
              </Link>
            )}
          />
          {
            receipt && receipt.contractCreated &&
            <TableCardRow
              name='Contract Created'
              icon='fas fa-file-invoice'
              badge={(
                <Link
                  to={`/contract/${receipt.contractCreated}`}
                  className='text-body'
                  onClick={() => this.modal.current.closeModal()}
                >
                  <code>{receipt.contractCreated}</code>
                </Link>
              )}
            />
          }
        </Table>
      )
    } else if (selected === 'params') {
      return (
        <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small my-0' element='pre'>
          <code>{JSON.stringify(params, null, 2)}</code>
        </Highlight>
      )
    } else if (selected === 'tx') {
      return (
        <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small my-0' element='pre'>
          <code>{JSON.stringify(txObject, null, 2)}</code>
        </Highlight>
      )
    } else if (selected === 'receipt') {
      return (
        <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small my-0' element='pre'>
          <code>{JSON.stringify(receipt, null, 2)}</code>
        </Highlight>
      )
    } else if (selected === 'abi') {
      return (
        <Highlight language='javascript' className='pre-box bg2 pre-wrap break-all small my-0' element='pre'>
          <code>{JSON.stringify(abi, null, 2)}</code>
        </Highlight>
      )
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
    if (data && data.abi) {
      options.push({ key: 'abi', text: 'ABI' })
    }

    return (
      <Modal
        ref={this.modal}
        title='Transaction'
      >
        <div>
          <ButtonOptions
            size='sm'
            className='mb-3'
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
