import React, { PureComponent } from 'react'
import {
  Button,
  ListGroupItem,
  Modal,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import notification from '@obsidians/notification'
import Terminal from '@obsidians/terminal'
import { getConfluxBinFolder, checkConfluxVersion } from './checkConfluxUpdate'

export default class ListItemDocker extends PureComponent {
  constructor(props) {
    super(props)
    this.mounted = false
    this.state = {
      status: '', // '', 'NONE', 'INSTALLED', 'UPDATE'
      version: '',
      latestVersion: ''
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
    const { update, currentVersion, latestVersion } = await checkConfluxVersion()
    console.log(latestVersion, currentVersion)
    if (!currentVersion) {
      this.mounted && this.setState({ status: 'NONE', version: '', latestVersion })
      return
    }
    if (update) {
      this.mounted && this.setState({ status: 'UPDATE', version: currentVersion, latestVersion })
    } else {
      this.mounted && this.setState({ status: 'INSTALLED', version: currentVersion, latestVersion })
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
      case 'UPDATE':
        return <span>{this.state.latestVersion} update available. Current version {this.state.version}</span>
      default:
        return <span>Version {this.state.version}</span>
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
      case 'UPDATE':
        return <Button color='primary' onClick={this.updateConflux}>Update</Button>
      default:
        return null
    }
  }
  
  installConflux = async () => {
    this.modal.current.openModal()
    const version = `v${this.state.latestVersion}`
    setTimeout(async () => {
      let result
      let filename = ''
      let url = ''
      let command = ''
      if (process.env.OS_IS_LINUX) {
        filename = `conflux_linux_${version}.zip`
        url = `https://github.com/Conflux-Chain/conflux-rust/releases/download/${version}/${filename}`
        command = `wget -c ${url}`
      } else if (process.env.OS_IS_MAC) {
        filename = `conflux_mac_${version}.zip`
        url = `https://github.com/Conflux-Chain/conflux-rust/releases/download/${version}/${filename}`
        command = `curl -OL ${url}`
      } else {
        filename = `conflux_win10_x64_${version}.zip`
        url = `https://github.com/Conflux-Chain/conflux-rust/releases/download/${version}/${filename}`
        command = `wget ${url} -OutFile ${filename}`
      }
      result = await this.terminal.current.exec(command)
      if (result.code) {
        notification.error('Failed to Download Conflux', '')
        return
      }
      if (process.env.OS_IS_LINUX) {
        result = await this.terminal.current.exec(`unzip -o ${filename}`)
      } else if (process.env.OS_IS_MAC) {
        result = await this.terminal.current.exec(`unzip -o ${filename}`)
      } else {
        result = await this.terminal.current.exec(`expand-archive ${filename} -DestinationPath .`)
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

  updateConflux = async () => {
    this.modal.current.openModal()

    setTimeout(async () => {
      let deleteCommand = ''
      if (process.env.OS_IS_WINDOWS) {
        deleteCommand = 'rm -r -fo ./run'
      } else {
        deleteCommand = 'rm -rf ./run'
      }
      const result = await this.terminal.current.exec(deleteCommand)
      if (result.code) {
        notification.error('Failed to Update Conflux', '')
        return
      }
      this.installConflux()
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
