import React, { PureComponent } from 'react'

import { ToolbarButton } from '@obsidians/ui-components'

import projectManager from '../projectManager'

export default class TerminalButton extends PureComponent {
  state = {
    terminal: false,
  }

  componentDidMount () {
    projectManager.terminalButton = this
  }

  render () {
    const { size = 'sm' } = this.props

    return (
      <ToolbarButton
        id='terminal'
        size={size}
        icon='fas fa-terminal'
        color={this.state.terminal ? 'primary' : 'default'}
        onClick={() => projectManager.toggleTerminal(!this.state.terminal)}
      />
    )
  }
}
