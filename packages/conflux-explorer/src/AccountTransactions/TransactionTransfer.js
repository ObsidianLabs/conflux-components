import React from 'react'

import { Badge } from '@obsidians/ui-components'

import { util } from 'js-conflux-sdk'

import Address from './Address'

export default function ({ tx, owner }) {
  const amount = `${util.unit.fromDripToCFX(tx.value)} CFX`
  return (
    <div className='d-flex flex-row align-items-center'>
      <div className='flex-1 overflow-hidden'>
        <Address addr={tx.from} showTooltip={false}/>
      </div>
      <div className='mx-3 text-muted'>
        <i className='fas fa-arrow-alt-right' />
      </div>
      <div className='flex-1 overflow-hidden'>
        {
          tx.contractCreated &&
          <Address addr={tx.contractCreated} displayText='Contract Creation' redirect={false}/>
        }
        {
          !tx.contractCreated &&
          <Address addr={tx.to} showTooltip={false}/>
        }
      </div>
      <Badge pill color={tx.from === owner ? 'danger' : 'success'}>
        {amount}
      </Badge>
    </div>
  )
}