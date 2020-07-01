import React, { PureComponent } from 'react'
import moment from 'moment'

import {
  Modal,
  DeleteButton,
} from '@obsidians/ui-components'

import NodeVersionInstaller from './NodeVersionInstaller'
import instanceChannel from '../instanceChannel'

export default class NodeVersionModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      installed: [],
    }

    this.modal = React.createRef()
  }

  componentDidMount () {
    this.refreshVersions()
  }

  refreshVersions = async () => {
    this.setState({ loading: true })
    const versions = await instanceChannel.invoke('versions')
    this.setState({
      installed: versions,
      loading: false,
    })
    this.props.onVersionRefreshed(versions)
  }

  openModal = () => {
    this.modal.current.openModal()
  }

  deleteVersion = async version => {
    this.setState({ loading: true })
    await instanceChannel.invoke('deleteVersion', version)
    await this.refreshVersions()
  }

  renderTableBody = () => {
    if (this.state.loading) {
      return (
        <tr key='loading'>
          <td align='middle' colSpan={4}>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }

    if (!this.state.installed.length) {
      return (
        <tr>
          <td align='middle' colSpan={4}>
            (No Conflux node installed)
          </td>
        </tr>
      )
    }

    return (
      this.state.installed.map(v => (
        <tr key={`table-row-${v.Tag}`} className='hover-block'>
          <td>{v.Tag}</td>
          <td>{moment(v.CreatedAt, 'YYYY-MM-DD HH:mm:ss Z').format('LL')}</td>
          <td>{v.Size}</td>
          <td align='right'>
            <DeleteButton
              onConfirm={() => this.deleteVersion(v.Tag)}
              textConfirm='Click again to uninstall'
            />
          </td>
        </tr>
      ))
    )
  }

  render () {
    return (
      <Modal
        ref={this.modal}
        title='Conflux Version Manager'
        textCancel='Close'
        ActionBtn={
          <NodeVersionInstaller
            left
            color='success'
            onDownloaded={this.refreshVersions}
          />
        }
      >
        <table className='table table-sm table-hover table-striped'>
          <thead>
            <tr>
              <th style={{ width: '40%' }}>version</th>
              <th style={{ width: '35%' }}>created</th>
              <th style={{ width: '15%' }}>size</th>
              <th style={{ width: '10%' }} />
            </tr>
          </thead>
          <tbody>
            {this.renderTableBody()}
          </tbody>
        </table>
      </Modal>
    )
  }
}
