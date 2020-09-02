import React, { Component } from 'react'

import {
  Modal,
  FormGroup,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  CustomInput,
  Button,
  DebouncedFormGroup,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import { IpcChannel } from '@obsidians/ipc'
import Terminal from '@obsidians/terminal'
import { DockerImageInputSelector } from '@obsidians/docker'
import compilerManager from '@obsidians/conflux-compiler'

import actions from '../actions'

export default class NewProjectModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      name: '',
      projectRoot: '',
      template: 'coin',
      truffleVersion: '',
      creating: false,
    }

    this.modal = React.createRef()
    this.terminal = React.createRef()
    this.path = fileOps.current.path
    this.fs = fileOps.current.fs
    this.channel = new IpcChannel('conflux-project')

    actions.newProjectModal = this
  }

  openModal () {
    this.modal.current.openModal()
    return new Promise(resolve => { this.onConfirm = resolve })
  }

  chooseProjectPath = async () => {
    try {
      const projectRoot = await fileOps.current.chooseFolder()
      this.setState({ projectRoot })
    } catch (e) {

    }
  }

  onCreateProject = async () => {
    this.setState({ creating: true })

    let created = await this.createProject()

    if (created) {
      this.modal.current.closeModal()
      this.onConfirm(created)
      this.setState({ name: '', projectRoot: '', template: 'coin' })
    }
    this.setState({ creating: false })
  }

  createProject = async () => {
    let projectRoot
    const { name, template } = this.state
    if (!this.state.projectRoot) {
      projectRoot = this.path.join(fileOps.current.workspace, name)
    } else if (!this.path.isAbsolute(this.state.projectRoot)) {
      projectRoot = this.path.join(fileOps.current.workspace, this.state.projectRoot)
    } else {
      projectRoot = this.state.projectRoot
    }

    if (await fileOps.current.isDirectoryNotEmpty(projectRoot)) {
      notification.error('Cannot Create the Project', `<b>${projectRoot}</b> is not an empty directory.`)
      return false
    }

    if (template === 'metacoin') {
      const truffleVersion = this.state.truffleVersion
      if (!truffleVersion) {
        notification.error('Cannot Create the Project', 'Please select a version for Conflux Truffle.')
        return false
      }
      const projectDir = fileOps.current.getDockerMountPath(projectRoot)
      const cmd = [
        `docker run --rm -it`,
        `--name conflux-create-project`,
        `-v "${projectDir}:/project/${name}"`,
        `-w "/project/${name}"`,
        `confluxchain/conflux-truffle:${truffleVersion}`,
        `cfxtruffle unbox ${template}`,
      ].join(' ')
      try {
        await this.channel.invoke('createProject', { projectRoot, template })
        await this.terminal.current.exec(cmd)
      } catch (e) {
        notification.error('Cannot Create the Project', e.message)
        return false
      }
    } else {
      try {
        await this.channel.invoke('createProject', { projectRoot, template })
      } catch (e) {
        notification.error('Cannot Create the Project', e.message)
        return false
      }
    }

    notification.success('Successful', `New project <b>${name}</b> is created.`)
    return { projectRoot, name }
  }

  renderTruffleVersion = () => {
    if (this.state.template !== 'metacoin') {
      return null
    }
    return (
      <DockerImageInputSelector
        channel={compilerManager.channel}
        label='Conflux truffle version'
        noneName='Conflux Truffle'
        modalTitle='Conflux Truffle Manager'
        downloadingTitle='Downloading Conflux Truffle'
        selected={this.state.truffleVersion}
        onSelected={truffleVersion => this.setState({ truffleVersion })}
      />
    )
  }

  render () {
    const { name, creating } = this.state

    let placeholder = 'Project path'
    if (!this.state.projectRoot) {
      placeholder = this.path.join(fileOps.current.workspace, this.state.name || '')
    }

    return (
      <Modal
        ref={this.modal}
        overflow
        title='Create a New Project'
        textConfirm='Create Project'
        onConfirm={this.onCreateProject}
        pending={creating && 'Creating...'}
        confirmDisabled={!name}
      >
        <FormGroup>
          <Label>Project location</Label>
          <InputGroup>
            <Input
              placeholder={placeholder}
              value={this.state.projectRoot}
              onChange={e => this.setState({ projectRoot: e.target.value })}
            />
            <InputGroupAddon addonType='append'>
              <Button color='secondary' onClick={this.chooseProjectPath}>
                Choose...
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </FormGroup>
        <DebouncedFormGroup
          label='Project name'
          onChange={name => this.setState({ name })}
        />
        <FormGroup>
          <Label>Template</Label>
          <CustomInput
            type='select'
            id='project-template'
            value={this.state.template}
            onChange={event => this.setState({ template: event.target.value })}
          >
            <option value='coin'>coin</option>
            <option value='metacoin'>[Truffle] metacoin</option>
          </CustomInput>
        </FormGroup>
        {this.renderTruffleVersion()}
        <div style={{ display: this.state.creating ? 'block' : 'none'}}>
          <Terminal
            ref={this.terminal}
            active={this.state.creating}
            height='200px'
            logId='create-project'
            className='rounded overflow-hidden'
          />
        </div>
      </Modal>
    )
  }
}
