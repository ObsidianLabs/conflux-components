import { util, abi, format, sign, Drip } from 'js-conflux-sdk'

const display = value => {
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
  sign: {
    sha3: str => `0x${sign.sha3(Buffer.from(str.replace('0x', ''), 'hex')).toString('hex')}`
  },
  format: {
    bytes: format.bytes,
    address: format.address,
    hexAddress: format.hexAddress
  },
  unit: {
    fromValue: value => Drip(value).toCFX(),
    toValue: Drip.fromCFX,
    valueToGvalue: value => Drip(value).toGDrip()
  },
  display,
  decodeError: data => abi.errorCoder.decodeError({ data }).message
}