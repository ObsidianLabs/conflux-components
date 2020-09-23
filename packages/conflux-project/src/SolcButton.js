import React from 'react'

import { DockerImageSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/conflux-compiler'

import projectManager from './projectManager'

export default props => {
  return (
    <DockerImageSelector
      channel={compilerManager.solc}
      size='sm'
      icon='fas fa-hammer'
      title='Solc'
      noneName='solc'
      modalTitle='Solc Manager'
      downloadingTitle='Downloading Solc'
      selected={props.selected}
      onSelected={async selected => {
        const success = await projectManager.updateSolcVersion(selected)
        if (success) {
          props.onSelected(selected)
        }
      }}
    />
  )
}