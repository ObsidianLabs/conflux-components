import { util, abi, format, sign, Drip } from 'js-conflux-sdk'

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
  decodeError: data => abi.errorCoder.decodeError({ data }).message
}