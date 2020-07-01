import React, { PureComponent } from 'react'

import {
  Modal,
  ToolbarButton,
  DebouncedFormGroup,
  FormGroup,
  Label,
  CustomInput,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/conflux-node'
import { signatureProvider } from '@obsidians/conflux-sdk'
import notification from '@obsidians/notification'

export default class TransferButton extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      amount: '',
      recipient: '',
      assetId: '',
      assetList: [],
      pushing: false,
    }

    this.modal = React.createRef()
    this.amountInput = React.createRef()
  }

  openModal = async () => {
    if (!await this.refresh()) {
      return
    }
    this.modal.current.openModal()
    setTimeout(() => this.amountInput.current.focus(), 100)
  }

  refresh = async () => {
    const value = this.props.address
    if (!value || !nodeManager.sdk.isValidAddress(value)) {
      return
    }

    let account
    try {
      account = await nodeManager.sdk.accountFrom(value)
      if (account.assets) {
        const assetList = Object.entries(account.assets)
        this.setState({ assetList })
      }
      return true
    } catch (e) {
      return
    }
  }

  onChangeAmount = (amount) => {
    this.setState({ amount })
  }

  onChangeRecipient = (recipient) => {
    this.setState({ recipient })
  }

  push = async () => {
    const { recipient, amount, assetId } = this.state

    this.setState({ pushing: true })

    try {
      let result
      if (!assetId) {
        result = await nodeManager.sdk.transfer({
          from: this.props.address,
          to: recipient,
          amount: Number(amount)
        }, signatureProvider)
      } else {
        result = await nodeManager.sdk.transferAsset({
          assetId: Number(assetId),
          from: this.props.address,
          to: recipient,
          amount: Number(amount)
        }, signatureProvider)
      }
      notification.success('Transaction Pushed', `Transaction ID: <code>${result.txId}</code>`)
    } catch (e) {
      notification.error('Push Transaction Failed', e.message)
      this.setState({ pushing: false })
      return
    }

    this.setState({ pushing: false })
    this.modal.current.closeModal()
  }

  render () {
    const { amount, recipient, assetId, pushing } = this.state

    return (
      <React.Fragment>
        <ToolbarButton
          id='navbar-transfer'
          size='md'
          icon='fas fa-sign-out-alt'
          tooltip='Transfer'
          onClick={this.openModal}
        />
        <Modal
          ref={this.modal}
          overflow
          title='Transfer'
          textConfirm='Sign and Push'
          confirmDisabled={false}
          onConfirm={this.push}
          pending={pushing && 'Pushing...'}
        >
          <FormGroup>
            <Label>Asset</Label>
            <CustomInput
              id='transfer-token'
              type='select'
              value={assetId}
              onChange={event => {
                this.setState({ assetId: event.target.value })
              }}
            >
              <option value=''>ALGO</option>
              {this.state.assetList.map(entry => {
                const [assetId, asset] = entry
                return <AssetOption key={`transfer-asset-${assetId}`} assetId={assetId} />
              })}
            </CustomInput>
          </FormGroup>
          <DebouncedFormGroup
            ref={this.amountInput}
            label='Amount'
            maxLength='50'
            value={amount}
            onChange={this.onChangeAmount}
          />
          <DebouncedFormGroup
            label='Recipient'
            maxLength='100'
            value={recipient}
            onChange={this.onChangeRecipient}
          />
        </Modal>
      </React.Fragment>
    )
  }
}

class AssetOption extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      assetInfo: null
    }
  }

  componentDidMount () {
    this.getAssetInfo(this.props.assetId)
  }

  async getAssetInfo (assetId) {
    const assetInfo = await nodeManager.sdk.getAssetInfo(assetId)
    this.setState({ assetInfo })
  }

  render () {
    const { assetId } = this.props
    const { assetInfo } = this.state
    const info = assetInfo ? `${assetInfo.unitname} - ${assetInfo.assetname}` : 'Loading...'

    return (
      <option value={assetId}>{info} ({assetId})</option>
    )
  }
}
