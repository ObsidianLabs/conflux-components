import Workspace from '@obsidians/workspace'
import fileOps from '@obsidians/file-ops'
import { useBuiltinCustomTabs, modelSessionManager, defaultModeDetector } from '@obsidians/code-editor'
import compilerManager, { CompilerTerminal } from '@obsidians/conflux-compiler'

import projectManager from '../projectManager'

import ProjectToolbar from './ProjectToolbar'
import ProjectSettingsTab from './ProjectSettingsTab'

import addSolidityLanguage from './languages/solidity'

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

const makeContextMenu = contextMenu => node => {
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

Workspace.defaultProps = {
  projectManager,
  compilerManager,
  ProjectToolbar,
  CompilerTerminal,
  addLanguages: () => addSolidityLanguage(),
  makeContextMenu,
}

export default Workspace