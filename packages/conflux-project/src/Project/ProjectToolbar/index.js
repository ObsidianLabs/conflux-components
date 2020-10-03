import React, { PureComponent } from 'react'

import { ToolbarButton } from '@obsidians/ui-components'
import { CompilerButton } from '@obsidians/conflux-compiler'

import ProjectContext from '../ProjectContext'

import projectManager from '../../projectManager'
import DeployButton from './DeployButton'

export default class ProjectToolbar extends PureComponent {
  static contextType = ProjectContext

  render () {
    const projectSettings = this.context.projectSettings
    const compilers = projectSettings?.get('compilers') || {}

    return <>
      <CompilerButton
        className='rounded-0 border-0 flex-none w-5'
        cfxtruffle={compilers.cfxtruffle}
        solc={compilers.solc}
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
    </>
  }
}
