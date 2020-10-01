import React, { PureComponent } from 'react'
import { util } from 'js-conflux-sdk'

export default class TransactionFee extends PureComponent {
  render () {
    const { amount } = this.props
    const cfx = util.unit.fromDripToCFX(amount)
    const gdrip = util.unit.fromDripToGDrip(amount)
    let fee = ''

    if (cfx > 0.001) {
      fee = `${cfx} CFX`
    } else if (gdrip > 0.001) {
      fee = `${gdrip} Gdrip`
    } else {
      fee = `${amount} drip`
    }

    const id = `tooltip-fee-${amount}-${Math.floor(Math.random() * 1000)}`
    return (
      <>
        <span id={id} style={{ cursor: 'default', display: 'block', textAlign: 'right' }}>
          { fee }
        </span>
      </>
    )
  }
}
