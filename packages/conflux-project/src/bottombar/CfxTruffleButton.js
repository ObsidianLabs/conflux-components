import React from 'react'

import { DockerImageSelector } from '@obsidians/docker'
import { BaseProjectManager } from '@obsidians/workspace'
import compilerManager from '@obsidians/conflux-compiler'

export default () => {
  const [selected, onSelected] = React.useState('')

  React.useEffect(BaseProjectManager.effect('settings:compilers.cfxtruffle', onSelected), [])

  return (
    <DockerImageSelector
      channel={compilerManager.cfxtruffle}
      disableAutoSelection
      size='sm'
      icon='fas fa-cookie'
      title='CFX Truffle'
      noneName='Conflux Truffle'
      modalTitle='Conflux Truffle Manager'
      downloadingTitle='Downloading Conflux Truffle'
      selected={selected}
      onSelected={v => BaseProjectManager.instance.projectSettings?.set('compilers.cfxtruffle', v)}
    />
  )
}