import React, { PureComponent } from 'react'

import {
  Modal,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledButtonDropdown
} from '@obsidians/ui-components'

import Terminal from '@obsidians/terminal'

import instanceChannel from '../instanceChannel'

export default class NodeVersionInstaller extends PureComponent {
  constructor (props) {
    super(props)
    
    this.state = {
      loading: false,
      versions: [],
      downloadVersion: '',
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    this.fetchRemoteVersions()
  }

  fetchRemoteVersions = async () => {
    this.setState({ loading: true })
    let versions
    try {
      versions = await instanceChannel.invoke('remoteVersions', 10)
    } catch (e) {
      this.setState({ loading: false })
      console.warn(e)
      return
    }

    this.setState({ loading: false, versions })
  }

  onSelectVersion = downloadVersion => {
    this.setState({ downloadVersion })
    this.modal.current.openModal()
  }

  onDownloaded = ({ code }) => {
    if (code) {
      return
    }
    this.modal.current.closeModal()
    this.props.onDownloaded()
  }

  renderVersions = () => {
    const { loading, versions } = this.state
    if (loading) {
      return (
        <DropdownItem key='icon-loading-versions'>
          <i className='fas fa-spin fa-spinner mr-1' />Loading...
        </DropdownItem>
      )
    }

    if (!versions.length) {
      return (
        <DropdownItem disabled>
          (None)
        </DropdownItem>
      )
    }

    return versions.map(({ name }) => (
      <DropdownItem key={name} onClick={() => this.onSelectVersion(name)}>{name}</DropdownItem>
    ))
  }

  render () {
    const title = (
      <div key='icon-downloading'>
        <i className='fas fa-spinner fa-spin mr-2' />Downloading Conflux {this.state.downloadVersion}...
      </div>
    )
    return (
      <React.Fragment>
        <UncontrolledButtonDropdown size={this.props.size}>
          <DropdownToggle
            caret
            color={this.props.color || 'secondary'}
            onClick={() => this.fetchRemoteVersions()}
          >
            <i className='fas fa-download mr-1' />Install
          </DropdownToggle>
          <DropdownMenu right={this.props.right}>
            <DropdownItem header className='small'>Available Versions</DropdownItem>
            {this.renderVersions()}
          </DropdownMenu>
        </UncontrolledButtonDropdown>
        <Modal
          ref={this.modal}
          title={title}
        >
          <div className='rounded overflow-hidden'>
            <Terminal
              active
              logId='download'
              height='300px'
              cmd={`docker pull confluxchain/conflux-rust:${this.state.downloadVersion}`}
              onFinished={this.onDownloaded}
            />
          </div>
        </Modal>
      </React.Fragment>
    )
  }
}
