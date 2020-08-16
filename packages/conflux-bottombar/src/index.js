import React from 'react'
import CacheRoute from 'react-router-cache-route'

import { DockerImageSelector } from '@obsidians/docker'
import { KeypairButton } from '@obsidians/keypair'
import { TerminalButton } from '@obsidians/conflux-project'
import { AbiStorage } from '@obsidians/conflux-contract'
import compilerManager from '@obsidians/conflux-compiler'

export default function BottomBar (props) {
  return (
    <React.Fragment>
      <KeypairButton secretName='Private Key'>
        <div className='btn btn-primary btn-sm btn-flat'>
          <i className='fas fa-key' />
        </div>
      </KeypairButton>
      <AbiStorage>
        <div className='btn btn-default btn-sm btn-flat'>
          <i className='fas fa-list mr-1' />
          ABI Storage
        </div>
      </AbiStorage>
      <div className='flex-1' />
      <CacheRoute
        path={`/guest/:project`}
        render={() => (
          <DockerImageSelector
            channel={compilerManager.channel}
            icon='fas fa-hammer'
            title='Conflux Truffle'
            noneName='Conflux Truffle'
            modalTitle='Conflux Truffle Manager'
            downloadingTitle='Downloading Conflux Truffle'
            selected={props.compilerVersion}
            onSelected={compilerVersion => props.onSelectCompiler(compilerVersion)}
          />
        )}
      />
      <CacheRoute
        path={`/guest/:project`}
        component={TerminalButton}
      />
    </React.Fragment>
  )
}
