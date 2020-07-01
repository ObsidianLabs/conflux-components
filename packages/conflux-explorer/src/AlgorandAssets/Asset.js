import React, { PureComponent } from 'react'

import {
  TableCardRow,
} from '@obsidians/ui-components'

import nodeManager from '@obsidians/conflux-node'

export default class Asset extends PureComponent {
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
    const { assetId, asset } = this.props
    const { assetInfo } = this.state
    const assetName = assetInfo
      ? `${assetInfo.assetname} (${(assetId)})`
      : <span key={`asset-name-${assetId}`}><i className='fas fa-spin fa-spinner mr-1' />({assetId})</span>
    const amount = assetInfo
      ? `${(asset.amount / 10 ** assetInfo.decimals).toFixed(assetInfo.decimals)} ${assetInfo.unitname}`
      : <span key={`asset-amount-${assetId}`}>{asset.amount}<i className='fas fa-spin fa-spinner ml-1' /></span>

    return (
      <TableCardRow
        key={`asset-${assetId}`}
        name={assetName}
        icon='far fa-coins'
        badge={amount}
        badgeColor='success'
      />
    )
  }
}
