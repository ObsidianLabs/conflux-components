import { utils } from '@obsidians/eth-sdk'
import { Contract, format, Drip } from 'js-conflux-sdk'
import txOptions from './txOptions'
import { isValidAddress, formatAddress, hexAddress, base32Address, convertAddress } from './address'

const display = value => {
  if (typeof value === 'bigint') {
    value = value.toString()
  }
  const amount = Drip(value).toCFX()
  if (amount > 0.001) {
    return `${new Intl.NumberFormat().format(amount)} CFX`
  } else if (amount > 0.0000000001) {
    const gvalue = Drip(value).toGDrip()
    return `${new Intl.NumberFormat().format(gvalue)} Gdrip`
  } else {
    return `${new Intl.NumberFormat().format(value)} drip`
  }
}

export default {
  ...utils,
  txOptions,
  isValidAddress,
  isValidAddressReturn: formatAddress,
  formatAddress,
  convertAddress,
  abbreviateAddress: address => {
    address =  formatAddress(address)
    return `${address.substr(0, 12)}...${address.substr(address.length - 6, address.length)}`
  },
  format: {
    ...utils.format,
    address: format.address,
    hexAddress,
    base32Address,
  },
  unit: {
    fromValue: value => Drip(value).toCFX(),
    toValue: cfx => Drip.fromCFX(cfx).toString(),
    valueToGvalue: value => Drip(value).toGDrip()
  },
  display,
  decodeError: data => Contract.decodeError({ data }).message,
}