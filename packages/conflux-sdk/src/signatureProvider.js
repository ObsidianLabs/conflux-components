import keypairManager from '@obsidians/keypair'

export default function signatureProvider (address) {
  return async (tx, networkId) => {
    const privateKey = await keypairManager.getSecret(address)
    tx.sign(privateKey, networkId)
    return tx
  }
}