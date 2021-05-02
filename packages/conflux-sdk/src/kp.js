import { sign, format } from 'js-conflux-sdk'

// https://github.com/Conflux-Chain/js-conflux-sdk/blob/master/src/wallet/PrivateKeyAccount.js
const keygen = (pvk, networkId) => {
  // Get or create private key buffer
  const buffer = pvk || sign.randomPrivateKey()

  // Create buffers from private buffer
  const privateKeyBuffer = format.hexBuffer(buffer)
  const publicKeyBuffer = sign.privateKeyToPublicKey(privateKeyBuffer)
  const addressBuffer = sign.publicKeyToAddress(publicKeyBuffer)

  // Format buffers to actual value
  const publicKey = format.publicKey(publicKeyBuffer)
  const privateKey = format.privateKey(privateKeyBuffer)

  const address = networkId ? format.address(addressBuffer, networkId) : ''
  const hexAddress = format.hexAddress(addressBuffer)

  return { address, hexAddress, publicKey, privateKey }
}

const networkIds = {
  testnet: 1,
  mainnet: 1029,
  // dev: 999,
}

export default {
  newKeypair (chain) {
    const key = keygen(null, networkIds[chain])
    return {
      address: key.address || key.hexAddress,
      secret: key.privateKey,
    }
  },
  importKeypair (secret, chain) {
    const key = keygen(secret, networkIds[chain])
    return {
      address: key.address || key.hexAddress,
      secret: key.privateKey,
    }
  },
  exportKeypair (secret, networkId) {
    const key = keygen(secret, networkId)
    return {
      address: key.address || key.hexAddress,
      hexAddress: key.hexAddress,
      publicKey: key.publicKey,
      secret: key.secret
    }
  }
}