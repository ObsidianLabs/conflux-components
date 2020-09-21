import React, { PureComponent } from 'react'

import {
  ButtonOptions,
  Table,
  TableCardRow,
} from '@obsidians/ui-components'

import { util } from 'js-conflux-sdk'
import { Link } from 'react-router-dom'
import Highlight from 'react-highlight'

export default class TransactionDetails extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selected: 'basic',
    }
    this.modal = React.createRef()
  }

  renderContent = (tx, selected) => {
    const { txHash, status, data } = tx
    const { contractAddress, functionName, contractName, signer, params, value, tx: txObject, receipt, abi } = data || {}
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
            badge={status}
            badgeColor={status === 'FAILED' ? 'danger' : status === 'CONFIRMED' ? 'success' : 'warning'}
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
                  onClick={() => this.props.closeModal()}
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
                onClick={() => this.props.closeModal()}
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
                  onClick={() => this.props.closeModal()}
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
    const tx = this.props.tx || {}
    const selected = this.state.selected

    const options = [
      { key: 'basic', text: 'Basic' },
      { key: 'params', text: 'Parameters' },
    ]
    if (tx.data?.tx) {
      options.push({ key: 'tx', text: 'Tx' })
    }
    if (tx.data?.receipt) {
      options.push({ key: 'receipt', text: 'Receipt' })
    }
    if (tx.data?.abi) {
      options.push({ key: 'abi', text: 'ABI' })
    }

    return (
      <React.Fragment>
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
      </React.Fragment>
    )
  }
}