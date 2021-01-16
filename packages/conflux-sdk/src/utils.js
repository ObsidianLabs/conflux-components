import { util, abi } from 'js-conflux-sdk'

export default {
  sign: {
    sha3: str => `0x${util.sign.sha3(Buffer.from(str.replace('0x', ''), 'hex')).toString('hex')}`
  },
  format: {
    bytes: util.format.bytes
  },
  unit: {
    fromValue: util.unit.fromDripToCFX,
    toValue: util.unit.fromCFXToDrip,
    valueToGvalue: util.unit.fromDripToGDrip
  },
  decodeError: data => abi.errorCoder.decodeError({ data }).message
}