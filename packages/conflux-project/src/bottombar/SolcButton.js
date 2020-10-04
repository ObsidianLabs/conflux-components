import React from 'react'

import { DropdownItem } from '@obsidians/ui-components'

import notification from '@obsidians/notification'
import { DockerImageSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/conflux-compiler'

import projectManager from '../projectManager'

let n

export default () => {
  const [selected, onSelected] = React.useState('')

  React.useEffect(projectManager.effect('settings:compilers.solc', v => {
    n?.dismiss()
    if (v === 'default') {
      n = notification.info('Default Solc Selected', 'The version of solc used in compilation will be determined by <b>truffle-config.js</b>.', 4)
    } else if (v) {
      n = notification.info(`Solc v${v} Selected`, `This will overwrite the configuration of <b>truffle-config.js</b> in compilation.`, 4)
    }
    onSelected(v)
  }), [])

  return (
    <DockerImageSelector
      channel={compilerManager.solc}
      disableAutoSelection
      size='sm'
      icon='fas fa-hammer'
      title='Solc'
      noneName='solc'
      modalTitle='Solc Manager'
      downloadingTitle='Downloading Solc'
      selected={selected}
      onSelected={v => projectManager.projectSettings?.set('compilers.solc', v)}
    >
      <DropdownItem
        active={selected === 'default'}
        onClick={() => projectManager.projectSettings?.set('compilers.solc', 'default')}
      >
        Default Solc
      </DropdownItem>
      <DropdownItem divider />
    </DockerImageSelector>
  )
}