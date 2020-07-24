import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/conflux-node'
import moment from 'moment'

export default class RemoteNetwork extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      trend: null,
      status: null,
    }
  }

  componentDidMount () {
    this.refresh()
    this.h = setInterval(() => this.refreshBlock(), 1000)
  }

  componentDidUpdate (prevProps) {
    if (this.props.chain !== prevProps.chain) {
      this.refresh()
    }
  }

  componentWillUnmount () {
    clearInterval(this.h)
    this.h = undefined
  }

  async refresh () {
    this.setState({
      trend: null,
      status: null,
    })
    if (!nodeManager.sdk) {
      return
    }
    const chain = this.props.chain
    const trend = await nodeManager.sdk?.trend()
    if (this.props.chain === chain) {
      this.setState({ trend })
    }
  }

  async refreshBlock () {
    if (!nodeManager.sdk) {
      return
    }
    const chain = this.props.chain
    const status = await nodeManager.sdk?.client.cfx.getStatus()
    if (this.props.chain === chain) {
      this.setState({ status })
    }
  }

  render () {
    const { chain } = this.props

    return (
      <div className='d-flex flex-1 flex-column overflow-auto'>
        <div className='d-flex'>
          <div className='col-6 p-0 border-right-black'>
            <TableCard title={`Conflux Network (${chain})`}>
              <TableCardRow
                name='Node URL'
                badge={nodeManager.sdk?.url}
                badgeColor='primary'
              />
              <TableCardRow
                name='Chain ID'
                badge={this.state.status?.chainId}
              />
              <TableCardRow
                name='TPS'
                badge={this.state.trend && Number(this.state.trend?.tps.value).toFixed(6)}
              />
            </TableCard>
          </div>
          <div className='col-6 p-0'>
            <TableCard title='Blocks'>
              <TableCardRow
                name='Epoch'
                badge={this.state.status?.epochNumber}
              />
              <TableCardRow
                name='Block Number'
                badge={this.state.status?.blockNumber}
              />
              <TableCardRow
                name='Block Time'
                badge={this.state.trend ? `${Number(this.state.trend?.blockTime.value).toFixed(2)} s` : ''}
              />
              <TableCardRow
                name='Difficulty'
                badge={this.state.trend?.difficulty.value}
              />
              <TableCardRow
                name='Hash Rate'
                badge={this.state.trend && Number(this.state.trend?.hashRate.value).toFixed(0)}
              />
            </TableCard>
          </div>
        </div>
        <div className='d-flex flex-fill'>
          <div className='col-12 p-0 border-top-black'>
          </div>
        </div>
      </div>
    )
  }
}


