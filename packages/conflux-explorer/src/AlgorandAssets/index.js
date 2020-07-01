import React, { PureComponent } from 'react'

import {
  TableCard,
  Badge,
} from '@obsidians/ui-components'

import Asset from './Asset'

export default class AlgorandAssets extends PureComponent {
  render () {
    const { assets = {} } = this.props
    const assetList = Object.entries(assets)

    return (
      <TableCard
        title='Assets'
        right={<Badge pill color='primary'>{Object.keys(assets).length}</Badge>}
      >
      {
        assetList.map(entry => {
          const [assetId, asset] = entry
          return <Asset key={`asset-${assetId}`} assetId={assetId} asset={asset} />
        })
      }
      </TableCard>
    )
  }
}
