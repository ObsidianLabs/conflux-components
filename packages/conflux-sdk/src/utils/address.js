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

export function formatAddress (addr, chainId) {
  if (!addr) {
    return
  }
  if (chainId === 999) {
    return hexAddress(addr)
  } else {
    return base32Address(addr, chainId)
  }
}

export function hexAddress (addr) {
  if (address.hasNetworkPrefix(addr)) {
    return format.hexAddress(addr)
  }
  return addr
}

export function base32Address (addr, chainId = 1) {
  const base32 = format.address(addr, chainId, true)
  return base32.replace('TYPE.USER:', '').replace('TYPE.CONTRACT:', '').toLowerCase()
}

export function convertAddress (addr, chainId) {
  if (address.hasNetworkPrefix(addr)) {
    return format.hexAddress(addr)
  }
  return base32Address(addr, chainId)
}
