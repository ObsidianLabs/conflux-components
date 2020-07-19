import React, { PureComponent } from 'react'

import {
  Modal,
  IconButton,
  DeleteButton,
} from '@obsidians/ui-components'

import redux from '@obsidians/redux'
import notification from '@obsidians/notification'

import ViewAbiModal from './ViewAbiModal'
import AbiInputModal from './AbiInputModal'

export default class AbiStorageModal extends PureComponent {
  constructor (props) {
    super(props)

    this.modal = React.createRef()
    this.viewAbiModal = React.createRef()
    this.abiInputModal = React.createRef()

    this.state = {
      loading: false,
      abis: [],
      showPrivateKeys: false,
    }
  }

  openModal = () => {
    this.modal.current.openModal()
    this.refresh()
  }

  refresh () {
    this.setState({ loading: true })
    const abis = redux.getState().abis.toArray()
    this.setState({ abis, loading: false })
  }

  viewAbi = abi => {
    this.viewAbiModal.current.openModal(abi)
  }

  newAbi = async () => {
    const { codeHash, abi } = await this.abiInputModal.current.openModal()
    redux.dispatch('ABI_ADD', { codeHash, abi })
    notification.success(
      'ABI Added',
      `A new ABI record is added to the storage.`
    )
    this.refresh()
  }

  deleteAbi = async codeHash => {
    redux.dispatch('ABI_DELETE', codeHash)
    notification.info(
      'ABI Deleted',
      `The ABI record is removed from the storage.`
    )
    this.refresh()
  }

  renderTable = () => {
    if (this.state.loading) {
      return (
        <tr key='abis-loading' >
          <td align='middle' colSpan={3}>
            <i className='fas fa-spin fa-spinner mr-1' />Loading...
          </td>
        </tr>
      )
    }
    if (!this.state.abis || !this.state.abis.length) {
      return (
        <tr key='abis-none' >
          <td align='middle' colSpan={3}>
            (No ABIs)
          </td>
        </tr>
      )
    }
    return this.state.abis.map(this.renderAbiRow)
  }

  renderAbiRow = item => {
    let [codeHash, abi] = item
    abi = abi.get('abi')
    try {
      abi = JSON.stringify(JSON.parse(abi), null, 2)
    } catch (e) {}
    return (
      <tr key={`abi-${codeHash}`} className='hover-flex'>
        <td>
          <code className='small'>{codeHash}</code>
        </td>
        <td>
          <div className='d-flex'>
            <IconButton
              color='primary'
              onClick={() => this.viewAbi(abi)}
              icon='fas fa-eye'
            />
          </div>
        </td>
        <td align='right'>
          <DeleteButton
            className='hover-show'
            onConfirm={() => this.deleteAbi(codeHash)}
          />
        </td>
      </tr>
    )
  }

  render () {
    return (
      <React.Fragment>
        <Modal
          ref={this.modal}
          title='ABI Storage'
          textActions={['New']}
          textCancel='Close'
          onActions={[this.newAbi]}
        >
          <table className='table table-sm table-hover table-striped'>
            <thead>
              <tr>
                <th style={{ width: '80%' }}>Code Hash</th>
                <th style={{ width: '15%' }}>ABI</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {this.renderTable()}
            </tbody>
          </table>
        </Modal>
        <ViewAbiModal ref={this.viewAbiModal} />
        <AbiInputModal ref={this.abiInputModal} />
      </React.Fragment>
    )
  }
}