import React, { PureComponent } from 'react'

import {
  TableCard,
  TableCardRow,
} from '@obsidians/ui-components'

export default class AccountBalance extends PureComponent {
  render () {
    const { account } = this.props

    return (
      <TableCard title='Balance'>
        <TableCardRow
          name='Total'
          icon='far fa-wallet'
          badge={`${account.balance} CFX`}
          badgeColor='success'
        />

      </TableCard>
    )
  }
}
