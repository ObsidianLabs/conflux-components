import React from 'react'

import { DockerImageSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/conflux-compiler'

import projectManager from '../projectManager'

export default () => {
  const [selected, onSelected] = React.useState('')

  React.useEffect(projectManager.effect('settings:compilers.cfxtruffle', onSelected), [])

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
      onSelected={v => projectManager.projectSettings?.set('compilers.cfxtruffle', v)}
    />
  )
}