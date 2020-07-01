import React, { PureComponent } from 'react'

import { Badge } from '@obsidians/ui-components'

import moment from 'moment'

import TransactionTransfer from './TransactionTransfer'
// import TransactionAxfer from './TransactionAxfer'
// import TransactionAcfg from './TransactionAcfg'

export default class TransactionRow extends PureComponent {
  onClick = () => {

  }

  render () {
    const { tx, owner } = this.props
    
    let type = tx.type
    let typeColor = 'primary'
    let TxComponent = <TransactionTransfer tx={tx} owner={owner} />

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
