import React, { PureComponent } from 'react'

import {
  TableCard,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/conflux-node'

import TransactionRow from './TransactionRow'

export default class AlgorandTransactions extends PureComponent {
  state = {
    hasMore: true,
    loading: true,
    txs: [],
    cursor: '',
  }

  componentDidMount () {
    this.refresh(this.props.account)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.account !== this.props.account) {
      this.refresh(this.props.account)
    }
  }

  refresh = async account => {
    this.setState({ txs: [], loading: true })
    const { cursor, data: txs } = await nodeManager.sdk.getTransactions(account.address)
    this.setState({ txs, cursor, hasMore: !!cursor, loading: false })
  }

  loadMore = async () => {
    this.setState({ loading: true })
    const { cursor, data: txs } = await nodeManager.sdk.getTransactions(this.props.account.address, this.state.cursor)
    this.setState({
      txs: [...this.state.txs, ...txs],
      cursor,
      hasMore: !!cursor,
      loading: false,
    })
  }

  renderTableBody = () => {
    const rows = this.state.txs.map(tx => (
      <TransactionRow key={`tx-${tx.txid}`} tx={tx} owner={this.props.account.address} />
    ))

    if (this.state.loading) {
      rows.push(
        <tr key='txs-loading' className='bg-transparent'>
          <td align='middle' colSpan={5}>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    } else if (this.state.hasMore) {
      rows.push(
        <tr key='txs-loadmore' className='bg-transparent'>
          <td align='middle' colSpan={5}>
            <span className='btn btn-sm btn-secondary' onClick={this.loadMore}>Load More</span>
          </td>
        </tr>
      )
    }

    return rows
  }


  render () {
    return (
      <TableCard
        title='Transactions'
        tableSm
        TableHead={(
          <tr>
            <th style={{ width: '10%' }}>time</th>
            <th style={{ width: '10%' }}>block</th>
            <th style={{ width: '10%' }}>type</th>
            <th style={{ width: '70%' }}>tx</th>
          </tr>
        )}
      >
        {this.renderTableBody()}
      </TableCard>
    )
  }
}
