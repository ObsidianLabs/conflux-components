import React from 'react'
import { UncontrolledTooltip } from '@obsidians/ui-components'

const formatAddress = address => <code>{address.substr(0, 10)}...{address.substr(address.length - 6, address.length)}</code>
const accountAddress = address => `#/account/${address}`
// const contractAddress = address => `#/contract/${address}`

export default function Address ({ addr, redirect = true, displayText }) {
  if (!addr) {
    return null
  }
  const id = `tooltip-address-${addr}-${Math.floor(Math.random() * 1000)}`
  const hash = displayText ? displayText : formatAddress(addr)
  const url = accountAddress(addr)
  let text
  if (redirect) {
    text = (
      <a href={url} className='text-body small' id={id}>
        {hash}
      </a>
    )
  } else {
    text = (
      <span className='text-body small' id={id} style={{ cursor: 'default' }}>
        {hash}
      </span>
    )
  }
  return (
    <React.Fragment>
      {text}
      <UncontrolledTooltip trigger='hover' delay={0} target={id}>
        { addr }
      </UncontrolledTooltip>
    </React.Fragment>
  )
}
