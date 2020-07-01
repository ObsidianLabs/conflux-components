import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

export default class AlgorandBalance extends PureComponent {
  state = {
    loading: true,
    capacity: BigInt(0),
    cellsCount: 0,
  }

  render () {
    const { account } = this.props
    const { capacity, cellsCount } = this.state

    return (
      <TableCard title='Balance'>
        <TableCardRow
          name='Total'
          icon='far fa-wallet'
          badge={`${(account.amount / 10**6).toLocaleString('en', { maximumSignificantDigits: 6 })} ALGO`}
          badgeColor='success'
        />
        {/* <TableCardRow
          name='Available'
          icon='fas fa-cubes'
          badge={`${(account.amountwithoutpendingrewards / 10**6).toLocaleString()} ALGO`}
        /> */}
        <TableCardRow
          name='Rewards'
          icon='fas fa-cubes'
          badge={`${(account.rewards / 10**6).toLocaleString('en', { maximumSignificantDigits: 6 })} ALGO`}
        />
        <TableCardRow
          name='Pending Rewards'
          icon='fas fa-cubes'
          badge={`${(account.pendingrewards / 10**6).toLocaleString('en', { maximumSignificantDigits: 6 })} ALGO`}
        />
      </TableCard>
    )
  }
}
