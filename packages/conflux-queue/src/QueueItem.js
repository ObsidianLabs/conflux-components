import React from 'react'

import {
  Badge,
} from '@obsidians/ui-components'

import moment from 'moment'

export default ({ txHash, data, status, ts }) => {
  let iconClassName = 'fas fa-check-circle text-success mr-1'
  let statusComponent = null
  if (status === 'PUSHING') {
    iconClassName = 'fas fa-spinner-third fa-spin mr-1'
    statusComponent = <Badge color='warning' className='ml-1'>PUSHING</Badge>
  } else if (status === 'MINED') {
    iconClassName = 'fad fa-spinner-third fa-spin mr-1'
    statusComponent = <Badge color='warning' className='ml-1'>MINED</Badge>
  } else if (status === 'EXECUTED') {
    iconClassName = 'fas fa-circle-notch fa-spin mr-1'
    statusComponent = <Badge color='warning' className='ml-1'>EXECUTED</Badge>
  } else if (status === 'FAILED-TIMEOUT') {
    iconClassName = 'fas fa-times-circle text-danger mr-1'
    statusComponent = <Badge color='secondary' className='ml-1'>TIMEOUT</Badge>
  } else if (status === 'FAILED') {
    iconClassName = 'fas fa-times-circle text-danger mr-1'
  }
  return (
    <div key={`tx-${txHash}`}>
      <div className='d-flex flex-row justify-content-between align-items-end'>
        <span key={`tx-status-${status}`}>
          <i className={iconClassName} />
          <b>{data.name}</b>
          {statusComponent}
        </span>
        <span className='small text-muted'>
          <i className='far fa-clock mx-1' />
          {moment.unix(ts).format('MM/DD HH:mm:ss')}
        </span>
      </div>
      { data.contractAddress && <div className='small text-muted'><code>{data.contractAddress}</code></div> }
      { data.contractName && <div className='small text-muted'>{data.contractName}</div> }
    </div>
  )
}