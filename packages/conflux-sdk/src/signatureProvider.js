import keypairManager from '@obsidians/keypair'
import { util } from 'js-conflux-sdk'

export default function signatureProvider (address) {
  return async tx => {
    const privateKey = await keypairManager.getSecret(address)
    return util.sign.ecdsaSign(util.sign.sha3(tx.encode(false)), util.format.buffer(privateKey))
  }
}