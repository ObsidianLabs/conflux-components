import { address, format } from 'js-conflux-sdk'

export function isValidAddress (addr, chainId) {
  try {
    if (addr.toLowerCase().startsWith('cfxtest:') && chainId !== 1) {
      return false
    } else if (addr.toLowerCase().startsWith('cfx:') && chainId !== 1029) {
      return false
    }
    format.address(addr, chainId)
    return true
  } catch(e) {
    return false
  }
}

export function formatAddress (addr, targetChainId) {
  // note: the chinaId IS the target chain id, NOT the source chain id.
  if (!addr) {
    return
  }
  if (!targetChainId) return addr
  if (targetChainId === 999) {
    return hexAddress(addr)
  } else {
    return base32Address(addr, targetChainId)
  }
}

export function hexAddress (addr) {
  if (address.hasNetworkPrefix(addr)) {
    return format.hexAddress(addr)
  }
  return addr
}

export function base32Address (addr, targetChainId = null) {
  const { networkManager } = require('@obsidians/network')
  let chainId = targetChainId
  if (!chainId) {
    if (networkManager && networkManager.network && networkManager.network.chainId) {
      chainId = networkManager.network.chainId
    } else {
      chainId = 999
    }
  }
  const base32 = format.address(addr, targetChainId, true)
  return base32.replace('TYPE.USER:', '').replace('TYPE.CONTRACT:', '').toLowerCase()
}

export function convertAddress (addr, targetChainId) {
  if (address.hasNetworkPrefix(addr)) {
    return format.hexAddress(addr)
  }
  return base32Address(addr, targetChainId)
}
