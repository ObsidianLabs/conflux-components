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

  // With networkId, it is a Conflux base32 address - cfx:aak2rra2njvd77ezwjvx04kkds9fzagfe6ku8scz91
  const address = networkId ? format.address(addressBuffer, networkId) : undefined

  // Without networkId, it is a hex40 address - 0x1386b4185a223ef49592233b69291bbe5a80c527
  const hexAddress = format.hexAddress(addressBuffer)

  return { address, hexAddress, publicKey, privateKey }
}

export default {
  newKeypair () {
    const key = keygen()
    return {
      address: key.hexAddress,
      secret: key.privateKey,
    }
  },
  importKeypair (secret) {
    const key = keygen(secret)
    return {
      address: key.hexAddress,
      secret: key.privateKey,
    }
  },
  exportKeypair (secret, networkId) {
    const key = keygen(secret, networkId)
    return {
      address: key.address,
      hexAddress: key.hexAddress,
      publicKey: key.publicKey,
      secret: key.secret
    }
  }
}