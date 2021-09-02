import { sign, format } from 'js-conflux-sdk'
import { ethers } from 'ethers'

// https://github.com/Conflux-Chain/js-conflux-sdk/blob/master/src/wallet/PrivateKeyAccount.js
const keygen = (pvk, chainId) => {
  // Get or create private key buffer
  const buffer = pvk || sign.randomPrivateKey()

  // Create buffers from private buffer
  const privateKeyBuffer = format.hexBuffer(buffer)
  const publicKeyBuffer = sign.privateKeyToPublicKey(privateKeyBuffer)
  const addressBuffer = sign.publicKeyToAddress(publicKeyBuffer)

  // Format buffers to actual value
  const publicKey = format.publicKey(publicKeyBuffer)
  const privateKey = format.privateKey(privateKeyBuffer)

  const address = chainId ? format.address(addressBuffer, chainId) : ''
  const hexAddress = format.hexAddress(addressBuffer)

  return { address, hexAddress, publicKey, privateKey }
}

const chainIds = {
  testnet: 1,
  mainnet: 1029,
  // dev: 999,
}

export default {
  newKeypair (chain, secretType) {
    if (secretType === 'mnemonic') {
      const wallet = ethers.Wallet.createRandom({ path: `m/44'/503'/0'/0/0` })
      const key = keygen(wallet.privateKey, chainIds[chain])
      return {
        address: key.address || key.hexAddress,
        secret: wallet.mnemonic.phrase,
        secretName: 'Mnemonic',
      }
    } else {
      const key = keygen(null, chainIds[chain])
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
      const key = keygen(secret, chainIds[chain])
      return {
        address: key.address || key.hexAddress,
        secret: key.privateKey,
        secretName: 'Private Key',
      }
    } else {
      const wallet = ethers.Wallet.fromMnemonic(secret, `m/44'/503'/0'/0/0`)
      const key = keygen(wallet.privateKey, chainIds[chain])
      return {
        address: key.address || key.hexAddress,
        secret: wallet.mnemonic.phrase,
        secretName: 'Mnemonic',
      }
    }
  },
  walletFrom (secret) {
    if (secret.startsWith('0x')) {
      return new ethers.Wallet(secret)
    } else {
      return ethers.Wallet.fromMnemonic(secret, `m/44'/503'/0'/0/0`)
    }
  },
  exportKeypair (secret, chainId) {
    const key = keygen(secret, chainId)
    return {
      address: key.address || key.hexAddress,
      hexAddress: key.hexAddress,
      publicKey: key.publicKey,
      secret: key.secret
    }
  }
}