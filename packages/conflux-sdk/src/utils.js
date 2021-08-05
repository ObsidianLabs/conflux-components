import { address, abi, format, sign, Drip } from 'js-conflux-sdk'

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
  sign: {
    sha3: str => format.hex(sign.keccak256(format.hexBuffer(str)))
  },
  format: {
    big: format.big,
    bytes: format.bytes,
    bytesFromHex: format.hexBuffer,
    address: format.address,
    hexAddress: addr => {
      if (address.hasNetworkPrefix(addr)) {
        return format.hexAddress(addr)
      }
      return addr
    }
  },
  unit: {
    fromValue: value => Drip(value).toCFX(),
    toValue: cfx => Drip.fromCFX(cfx).toString(),
    valueToGvalue: value => Drip(value).toGDrip()
  },
  display,
  decodeError: data => abi.errorCoder.decodeError({ data }).message
}