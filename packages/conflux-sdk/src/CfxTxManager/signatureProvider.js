import keypairManager from '@obsidians/keypair'
import kp from '../kp'

export default function signatureProvider (address) {
  return async (tx, networkId) => {
    const secret = await keypairManager.getSecret(address)
    const wallet = kp.walletFrom(secret)
    tx.sign(wallet.privateKey, networkId)
    return tx
  }
}