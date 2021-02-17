export { default } from './Sdk'

export { default as utils } from './utils'
export { default as kp } from './kp'
export { default as signatureProvider } from './signatureProvider'

export { default as redux } from './redux'
export { default as networks } from './networks'
export { default as txOptions } from './txOptions'
export const namedContracts = {
  '0x0888000000000000000000000000000000000000': 'AdminControl',
  '0x0888000000000000000000000000000000000001': 'SponsorWhitelistControl',
  '0x0888000000000000000000000000000000000002': 'Staking',
}
