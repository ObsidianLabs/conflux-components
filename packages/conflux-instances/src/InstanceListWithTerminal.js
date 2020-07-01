import React from 'react'

import {
  SplitPane
} from '@obsidians/ui-components'

import { NodeTerminal } from '@obsidians/conflux-node'

import InstanceList from './InstanceList'

export default function InstanceListWithTerminal (props) {
  const { active, network = 'dev', onLifecycle } = props
  return (
    <SplitPane
      split='horizontal'
      primary='second'
      defaultSize={260}
      minSize={200}
    >
      <InstanceList chain={network} onLifecycle={onLifecycle} />
      <NodeTerminal active={active} />
    </SplitPane>
  )
}
