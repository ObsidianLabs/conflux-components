import React, { PureComponent } from 'react'
import {
  Button,
  ListGroupItem,
  Modal,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import Terminal from '@obsidians/terminal'
import { checkConfluxVersion, getConfluxBinFolder } from './checkDependencies'

export default class ListItemDocker extends PureComponent {
  constructor(props) {
    super(props)
    this.mounted = false
    this.state = {
      status: '', // '', 'NONE', 'INSTALLED'
      version: ''
    }
    this.modal = React.createRef()
    this.terminal = React.createRef()
  }

  componentDidMount () {
    this.mounted = true
  }

  componentWillUnmount () {
    this.mounted = false
  }

  refresh = async () => {
    const version = await checkConfluxVersion()
    if (version) {
      this.mounted && this.setState({ status: 'INSTALLED', version })
    } else {
      this.mounted && this.setState({ status: 'NONE', version: '' })
    }
  }

  renderIcon = () => {
    switch (this.state.status) {
      case '':
      case 'NONE':
        return <span key='fail'><i className='fas fa-minus-circle mr-2 text-muted' /></span>
      case 'INSTALLED':
        return <span key='success'><i className='fas fa-check-circle mr-2 text-success' /></span>
      default:
        return null
    }
  }

  renderSubtitle = () => {
    switch (this.state.status) {
      case '':
        return <span>Loading...</span>
      case 'NONE':
        return <span>The main software that runs the Conflux node.</span>
      default:
        return <span>{this.state.version}</span>
    }
  }

  renderButton = () => {
    switch (this.state.status) {
      case '':
        return null
      case 'NONE':
        return <Button color='primary' onClick={this.installConflux}>Install</Button>
      case 'INSTALLED':
        return <Button color='secondary'>Installed</Button>
      default:
        return null
    }
  }
  
  installConflux = async () => {
    this.modal.current.openModal()
    setTimeout(async () => {
      let result
      if (process.env.OS_IS_LINUX) {
        result = await this.terminal.current.exec('wget -c https://github.com/Conflux-Chain/conflux-rust/releases/download/v0.6.0/conflux_linux_v0.6.0.zip')
      } else {
        result = await this.terminal.current.exec('wget -c https://github.com/Conflux-Chain/conflux-rust/releases/download/v0.6.0/conflux_mac_v0.6.0.zip')
      }
      if (result.code) {
        notification.error('Failed to Download Conflux', '')
        return
      }
      if (process.env.OS_IS_LINUX) {
        result = await this.terminal.current.exec('unzip -o conflux_linux_v0.6.0.zip')
    } else {
        result = await this.terminal.current.exec('unzip -o conflux_mac_v0.6.0.zip')
      }
      if (result.code) {
        notification.error('Failed to Decompress Conflux', '')
        return
      }
      this.modal.current.closeModal()
      notification.success('Conflux Node Installed', '')
      this.refresh()
    }, 100)
  }

  render () {
    return (
      <React.Fragment>
        <ListGroupItem>
          <div className='align-items-center d-flex flex-row justify-content-between'>
            <div>
              <h5>
                {this.renderIcon()}
                <a
                  href='#'
                  className='text-white'
                  onClick={() => fileOps.current.openLink('https://github.com/Conflux-Chain/conflux-rust/releases')}
                >Conflux Node</a>
              </h5>
              {this.renderSubtitle()}
            </div>
            {this.renderButton()}
          </div>
        </ListGroupItem>
        <Modal
          ref={this.modal}
          title='Install Conflux Node...'
        >
          <div className='rounded overflow-hidden'>
            <Terminal
              ref={this.terminal}
              active
              logId='install-conflux'
              height='300px'
              cwd={getConfluxBinFolder()}
            />
          </div>
        </Modal>
      </React.Fragment>
    )
  }
}
