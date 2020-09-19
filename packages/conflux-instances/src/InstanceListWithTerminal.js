import React from 'react'

import {
  SplitPane
} from '@obsidians/ui-components'

import { NodeTerminal } from '@obsidians/conflux-node'

import InstanceList from './InstanceList'
import RemoteNetwork from './RemoteNetwork'

export default function InstanceListWithTerminal (props) {
  const { active, network = 'dev', onLifecycle } = props
  if (network === 'dev') {
    return (
      <SplitPane
        split='horizontal'
        primary='second'
        defaultSize={260}
        minSize={200}
      >
        <InstanceList chain={network} onLifecycle={onLifecycle} />
        <NodeTerminal active={active} miner={network !== 'dev'} />
      </SplitPane>
    )
  }

  return (
    <RemoteNetwork chain={network} />
  )
}
