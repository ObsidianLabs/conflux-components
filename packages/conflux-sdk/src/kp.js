import { sign, format } from 'js-conflux-sdk'
import { Wallet } from '@ethersproject/wallet'

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
  newKeypair (chain, secretType) {
    if (secretType === 'mnemonic') {
      const wallet = Wallet.createRandom({ path: `m/44'/503'/0'/0/0` })
      const key = keygen(wallet.privateKey, networkIds[chain])
      return {
        address: key.address || key.hexAddress,
        secret: wallet.mnemonic.phrase,
        secretName: 'Mnemonic',
      }
    } else {
      const key = keygen(null, networkIds[chain])
      return {
        address: key.address || key.hexAddress,
        secret: key.privateKey,
        secretName: 'Private Key',
      }
    }
  },
  importKeypair (secret = '', chain) {
    if (secret.startsWith('0x') || /^[0-9a-zA-Z]{64}$/.test(secret)) {
      if (!secret.startsWith('0x')) {
        secret = '0x' + secret
      }
      const key = keygen(secret, networkIds[chain])
      return {
        address: key.address || key.hexAddress,
        secret: key.privateKey,
        secretName: 'Private Key',
      }
    } else {
      const wallet = Wallet.fromMnemonic(secret, `m/44'/503'/0'/0/0`)
      const key = keygen(wallet.privateKey, networkIds[chain])
      return {
        address: key.address || key.hexAddress,
        secret: wallet.mnemonic.phrase,
        secretName: 'Mnemonic',
      }
    }
  },
  walletFrom (secret) {
    if (secret.startsWith('0x')) {
      return new Wallet(secret)
    } else {
      return Wallet.fromMnemonic(secret, `m/44'/503'/0'/0/0`)
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