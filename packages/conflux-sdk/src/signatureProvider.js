import keypairManager from '@obsidians/keypair'

export default function signatureProvider (address) {
  return async tx => {
    const privateKey = await keypairManager.getSigner(address)
    tx.sign(privateKey)
    return tx
  }
}