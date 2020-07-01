import React, { PureComponent } from 'react'

import {
  Modal,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledButtonDropdown
} from '@obsidians/ui-components'

import Terminal from '@obsidians/terminal'

import compilerManager from '../compilerManager'

export default class CompilerInstaller extends PureComponent {
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
    this.fetchVersions()
  }

  fetchVersions = async () => {
    this.setState({ loading: true })
    let versions
    try {
      versions = await compilerManager.invoke('remoteVersions', 10)
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
        <DropdownItem key='icon-loading-compiler-versions'>
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
      <div key='icon-downloading-compiler'>
        <i className='fas fa-spinner fa-spin mr-2' />Downloading Truffle {this.state.downloadVersion}...
      </div>
    )
    return (
      <React.Fragment>
        <UncontrolledButtonDropdown size={this.props.size}>
          <DropdownToggle
            caret
            color={this.props.color || 'secondary'}
            onClick={() => this.fetchVersions()}
          >
            <i className='fas fa-download mr-1' />Install
          </DropdownToggle>
          <DropdownMenu right={this.props.right}>
            <DropdownItem header className='small'>Available Truffle Versions</DropdownItem>
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
              logId='download-compiler'
              height='300px'
              cmd={`docker pull obsidians/truffle:${this.state.downloadVersion}`}
              onFinished={this.onDownloaded}
            />
          </div>
        </Modal>
      </React.Fragment>
    )
  }
}
