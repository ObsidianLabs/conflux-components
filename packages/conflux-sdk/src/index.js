import { makeSdk } from '@obsidians/eth-sdk'

import kp from './kp'
import networks from './networks'

import CfxClient from './CfxClient'
import CfxContract from './CfxContract'
import CfxTxManager from './CfxTxManager'

import BrowserExtension from './BrowserExtension'

import utils from './utils'
import rpc from './rpc'

export default makeSdk({
  kp,
  networks,
  namedContracts: {
    '0x0888000000000000000000000000000000000000': 'AdminControl',
    '0x0888000000000000000000000000000000000001': 'SponsorWhitelistControl',
    '0x0888000000000000000000000000000000000002': 'Staking',
  },
  Client: CfxClient,
  Contract: CfxContract,
  TxManager: CfxTxManager,
  BrowserExtension,
  utils,
  rpc,
})

export { default as redux } from './redux'
