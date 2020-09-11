import React, { PureComponent } from 'react'

import Workspace, { ProjectLoading, ProjectInvalid } from '@obsidians/workspace'
import fileOps from '@obsidians/file-ops'
import { useBuiltinCustomTabs, modelSessionManager, defaultModeDetector } from '@obsidians/code-editor'
import compilerManager, { CompilerTerminal } from '@obsidians/conflux-compiler'

import projectManager from '../projectManager'
import ProjectSettings from './ProjectSettings'

import ProjectToolbar from './ProjectToolbar'
import ProjectSettingsTab from './ProjectSettingsTab'

import solidity from './languages/solidity'

useBuiltinCustomTabs(['markdown'])
modelSessionManager.registerCustomTab('settings', ProjectSettingsTab, 'Project Settings')
modelSessionManager.registerModeDetector(filePath => {
  const { base } = fileOps.current.path.parse(filePath)
  if (base === 'config.json') {
    return 'settings'
  } else if (base.endsWith('.sol')) {
    return 'solidity'
  } else {
    return defaultModeDetector(filePath)
  }
})


export default class Project extends PureComponent {
  constructor (props) {
    super(props)
    this.workspace = React.createRef()
    this.state = {
      loading: true,
      invalid: false,
      initialFile: undefined,
      terminal: false,
    }
  }

  async componentDidMount () {
    projectManager.project = this
    solidity()
    this.prepareProject(this.props.projectRoot)
  }

  async componentDidUpdate (prevProps, prevState) {
    if (this.state.terminal !== prevState.terminal) {
      window.dispatchEvent(new Event('resize'))
    }
    if (this.props.projectRoot !== prevProps.projectRoot) {
      this.prepareProject(this.props.projectRoot)
    }
  }

  async prepareProject (projectRoot) {
    this.setState({ loading: true, invalid: false })

    if (!await fileOps.current.isDirectory(projectRoot)) {
      this.setState({ loading: false, invalid: true })
      return
    }

    this.projectSettings = new ProjectSettings(projectRoot)

    try {
      await this.projectSettings.readSettings()
    } catch (e) {
      this.setState({
        loading: false,
        initialFile: this.projectSettings.configPath,
      })
      return
    }

    if (await this.projectSettings.isMainValid()) {
      this.setState({
        loading: false,
        initialFile: this.projectSettings.mainPath,
      })
      return
    }

    this.setState({
      loading: false,
      initialFile: this.projectSettings.configPath,
    })
  }

  saveAll = async () => {
    return await this.workspace.current.saveAll()
  }

  toggleTerminal = terminal => {
    this.setState({ terminal })
    if (terminal) {
      compilerManager.focus()
    }
  }

  openProjectSettings = () => {
    this.workspace.current.openFile(this.projectSettings.configPath)
  }

  makeContextMenu = contextMenu => node => {
    if (node.children || !node.name.endsWith('.json')) {
      return contextMenu
    }
    const cloned = [...contextMenu]
    cloned.splice(5, 0, {
      text: 'Deploy',
      onClick: () => projectManager.deploy(node.path),
    }, null)
    return cloned
  }

  render () {
    const {
      projectRoot,
      nodeVersion,
      compilerVersion,
      InvalidProjectActions = null,
    } = this.props
    const { terminal } = this.state

    if (this.state.loading) {
      return <ProjectLoading projectRoot={projectRoot} />
    }

    if (this.state.invalid) {
      return (
        <ProjectInvalid projectRoot={projectRoot || '(undefined)'}>
          {InvalidProjectActions}
        </ProjectInvalid>
      )
    }

    return (
      <Workspace
        ref={this.workspace}
        theme={this.props.theme}
        projectRoot={projectRoot}
        initialFile={this.state.initialFile}
        terminal={terminal}
        defaultSize={272}
        makeContextMenu={this.makeContextMenu}
        Toolbar={(
          <ProjectToolbar
            projectRoot={projectRoot}
            nodeVersion={nodeVersion}
            compilerVersion={compilerVersion}
          />
        )}
        onToggleTerminal={terminal => projectManager.toggleTerminal(terminal)}
        Terminal={<CompilerTerminal active={terminal} cwd={projectRoot} />}
      />
    )
  }
}