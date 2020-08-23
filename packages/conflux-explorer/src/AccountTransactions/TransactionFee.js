import React, { PureComponent } from 'react'
import { UncontrolledTooltip } from '@obsidians/ui-components'

export default class TransactionFee extends PureComponent {
  render () {
    const { amount, unit } = this.props
    const fee = amount < 0.00001 ? `< 0.00001 ${unit}` : `${amount} ${unit}`
    const id = `tooltip-fee-${unit}-${Math.floor(Math.random() * 1000)}`
    return (
      <React.Fragment>
        <span id={id} style={{ cursor: 'default' }}>
          { fee }
        </span>
        <UncontrolledTooltip trigger='hover' delay={0} target={id}>
          { `${amount} ${unit}` }
        </UncontrolledTooltip>
      </React.Fragment>
    )
  }
}
