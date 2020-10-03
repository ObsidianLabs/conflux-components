import React from 'react'

import { DockerImageSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/conflux-compiler'

import projectManager from '../projectManager'

export default props => {
  React.useEffect(() => {
    projectManager.channel.off('settings:compilers.cfxtruffle')
    projectManager.channel.on('settings:compilers.cfxtruffle', v => {
      onSelected(v)
    })
  }, [props.match?.params?.project])

  const [selected, onSelected] = React.useState('')

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