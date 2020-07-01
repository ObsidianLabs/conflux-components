import React, { PureComponent } from 'react'

import { Badge } from '@obsidians/ui-components'

import moment from 'moment'

import TransactionPay from './TransactionPay'
import TransactionAxfer from './TransactionAxfer'
import TransactionAcfg from './TransactionAcfg'

export default class TransactionRow extends PureComponent {
  onClick = () => {

  }

  render () {
    const { tx, owner } = this.props
    
    let type = tx.type
    let typeColor = 'primary'
    let TxComponent = null
    if (tx.type === 'pay') {
      TxComponent = <TransactionPay tx={tx} owner={owner} />
    } else if (tx.type === 'axfer') {
      TxComponent = <TransactionAxfer tx={tx} owner={owner} />
      if (tx.amount) {
        type = 'asset transfer'
      } else {
        type = 'opt in'
      }
    } else if (tx.type === 'acfg') {
      TxComponent = <TransactionAcfg tx={tx} />
      if (tx.totalSupply) {
        type = 'create'
        typeColor = 'success'
      } else {
        type = 'destroy'
        typeColor = 'danger'
      }
    } else if (tx.type === 'afrz') {
    } else if (tx.type === 'keyreg') {
    }

    return (
      <tr onClick={this.onClick}>
        <td><small>{moment(tx.timestamp * 1000).format('MM/DD HH:mm:ss')}</small></td>
        <td><small>{tx.round}</small></td>
        <td>
          <div className='d-flex flex-row align-items-center'>
            <Badge pill color={typeColor}>{type}</Badge>
          </div>
        </td>
        <td>{TxComponent}</td>
      </tr>
    )
  }
}
