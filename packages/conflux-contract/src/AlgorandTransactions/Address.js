import React from 'react'

export default function Address ({ addr }) {
  if (!addr) {
    return null
  }
  return (
    <a href={`#/account/${addr}`} className='text-body small'>
      <code>{addr.substr(0, 8)}...{addr.substr(50, 58)}</code>
    </a>
  )
}
