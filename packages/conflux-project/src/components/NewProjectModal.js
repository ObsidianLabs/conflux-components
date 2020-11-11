import React from 'react'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'

import { NewProjectModal } from '@obsidians/workspace'
import { DockerImageInputSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/conflux-compiler'

export default class NewConfluxProjectModal extends NewProjectModal {
  constructor (props) {
    super(props)

    this.state = {
      ...this.state,
      truffleVersion: '',
    }
  }

  async createProject ({ projectRoot, name, template }) {
    if (platform.isDesktop && template === 'metacoin') {
      this.setState({ showTerminal: true })
      const truffleVersion = this.state.truffleVersion
      if (!truffleVersion) {
        notification.error('Cannot Create the Project', 'Please select a version for Conflux Truffle.')
        return false
      }
      await fileOps.current.ensureDirectory(projectRoot)
      const projectDir = fileOps.current.getDockerMountPath(projectRoot)
      const cmd = [
        `docker run --rm -it`,
        `--name conflux-create-project`,
        `-v "${projectDir}:/project/${name}"`,
        `-w "/project/${name}"`,
        `obsidians/conflux-truffle:${truffleVersion}`,
        `cfxtruffle unbox ${template}`,
      ].join(' ')

      const result = await this.terminal.current.exec(cmd)

      if (result.code) {
        notification.error('Cannot Create the Project')
        return false
      }

      const config = {
        main: './contracts/MetaCoin.sol',
        deploy: './build/contracts/MetaCoin.json',
        compilers: {
          cfxtruffle: truffleVersion,
          solc: 'default'
        }
      }
      await fileOps.current.writeFile(fileOps.current.path.join(projectRoot, 'config.json'), JSON.stringify(config, null, 2))
      return { projectRoot, name }
    } else {
      return super.createProject({ projectRoot, name, template })
    }
  }

  renderOtherOptions = () => {
    if (this.state.template !== 'metacoin') {
      return null
    }
    return (
      <DockerImageInputSelector
        channel={compilerManager.cfxtruffle}
        label='Conflux truffle version'
        noneName='Conflux Truffle'
        modalTitle='Conflux Truffle Manager'
        downloadingTitle='Downloading Conflux Truffle'
        selected={this.state.truffleVersion}
        onSelected={truffleVersion => this.setState({ truffleVersion })}
      />
    )
  }
}

NewConfluxProjectModal.defaultProps = {
  defaultTemplate: 'coin',
  templates: [
    { id: 'coin', display: 'Coin' },
    {
      group: 'Conflux Truffle',
      badge: 'Conflux Truffle',
      children: [
        { id: 'metacoin', display: 'Metacoin' },
      ],
    },
  ]
}
