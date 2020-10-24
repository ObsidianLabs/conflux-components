import React from 'react'

import {
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import {
  WorkspaceContext,
  BaseProjectManager,
  AbstractProjectSettingsTab,
  ProjectPath,
} from '@obsidians/workspace'

import { DockerImageInputSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/conflux-compiler'

export default class ProjectSettingsTab extends AbstractProjectSettingsTab {
  static contextType = WorkspaceContext

  componentDidMount () {
    BaseProjectManager.channel.on('settings', this.debouncedUpdate)
  }
  
  componentWillUnmount () {
    BaseProjectManager.channel.off('settings', this.debouncedUpdate)
  }

  render () {
    const { projectRoot, projectSettings } = this.context

    return (
      <div className='custom-tab bg2'>
        <div className='jumbotron bg-transparent text-body'>
          <div className='container'>
            <h1>Project Settings</h1>
            <ProjectPath projectRoot={projectRoot} />

            <h4 className='mt-4'>General</h4>
            <DebouncedFormGroup
              code
              label='Main file'
              className='bg-black'
              value={projectSettings?.get('main')}
              onChange={this.onChange('main')}
              placeholder={`Required`}
            />
            <DebouncedFormGroup
              code
              label='Smart contract to deploy'
              className='bg-black'
              value={projectSettings?.get('deploy')}
              onChange={this.onChange('deploy')}
              placeholder={`Required`}
            />
            <h4 className='mt-4'>Compilers</h4>
            <DockerImageInputSelector
              channel={compilerManager.cfxtruffle}
              disableAutoSelection
              bg='bg-black'
              label='Conflux truffle version'
              noneName='Conflux Truffle'
              modalTitle='Conflux Truffle Manager'
              downloadingTitle='Downloading Conflux Truffle'
              selected={projectSettings?.get('compilers.cfxtruffle')}
              onSelected={cfxtruffle => this.onChange('compilers.cfxtruffle')(cfxtruffle)}
            />
            <DockerImageInputSelector
              channel={compilerManager.solc}
              disableAutoSelection
              bg='bg-black'
              label='Solc version'
              noneName='solc'
              modalTitle='Solc Manager'
              downloadingTitle='Downloading Solc'
              extraOptions={[{
                id: 'default',
                display: 'Default Solc',
                onClick: () => this.onChange('compilers.solc')('default')
              }]}
              selected={projectSettings?.get('compilers.solc')}
              onSelected={solc => this.onChange('compilers.solc')(solc)}
            />
          </div>
        </div>
      </div>
    )
  }
}
