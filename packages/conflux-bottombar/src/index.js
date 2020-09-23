import React from 'react'
import CacheRoute from 'react-router-cache-route'

import { KeypairButton } from '@obsidians/keypair'
import { QueueButton } from '@obsidians/conflux-queue'
import { AbiStorage } from '@obsidians/conflux-contract'
import { DockerImageSelector } from '@obsidians/docker'
import { TerminalButton, SolcButton } from '@obsidians/conflux-project'
import compilerManager from '@obsidians/conflux-compiler'

export default function BottomBar (props) {
  return (
    <React.Fragment>
      <KeypairButton secretName='Private Key'>
        <div className='btn btn-primary btn-sm btn-flat'>
          <i className='fas fa-key' />
        </div>
      </KeypairButton>
      <QueueButton txs={props.txs} />
      <AbiStorage>
        <div className='btn btn-default btn-sm btn-flat text-muted'>
          <i className='fas fa-list mr-1' />
          ABI Storage
        </div>
      </AbiStorage>
      <div className='flex-1' />
      <CacheRoute
        path={`/guest/:project`}
        render={() => (
          <DockerImageSelector
            channel={compilerManager.cfxtruffle}
            size='sm'
            icon='fas fa-cookie'
            title='CFX Truffle'
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
        render={() => (
          <SolcButton selected={props.solc} onSelected={solc => props.onSelectSolc(solc)} />
        )}
      />
      <CacheRoute
        path={`/guest/:project`}
        component={TerminalButton}
      />
    </React.Fragment>
  )
}
