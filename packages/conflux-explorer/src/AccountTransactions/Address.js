import React from 'react'

export default function Address ({ addr }) {
  if (!addr) {
    return null
  }
  return (
    <a href={`#/account/${addr}`} className='text-body small'>
      <code>{addr.substr(0, 10)}...{addr.substr(34, 42)}</code>
    </a>
  )
}
