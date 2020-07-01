import React from 'react'

import { ToolbarButton } from '@obsidians/ui-components'
import { CompilerButton } from '@obsidians/conflux-compiler'

import projectManager from '../projectManager'
import DeployButton from './DeployButton'

export default function ProjectToolbar ({ projectRoot, compilerVersion, nodeVersion }) {
  return (
    <React.Fragment>
      <CompilerButton
        className='rounded-0 border-0 flex-none w-5'
        nodeVersion={nodeVersion}
        compilerVersion={compilerVersion}
        onClick={() => projectManager.compile()}
      />
      <DeployButton />
      <div className='flex-1' />
      <ToolbarButton
        id='settings'
        icon='fas fa-cog'
        tooltip='Project Settings'
        onClick={() => projectManager.openProjectSettings()}
      />
    </React.Fragment>
  )
}
