

function prepare (parameters, asObject, sdk) {
  if (!parameters) {
    return []
  }
  const obj = parameters.obj
  const keys = Object.keys(obj)
  const values = keys.map(key => {
    const param = obj[key]
    if (param.type === 'address') {
      return sdk.utils.format.base32Address(param.value, sdk.chainId)
    } else if (param.type === 'tuple') {
      return prepare({ obj: param.value }, true)
    } else if (param.type.endsWith('[]') && !param.value.length) {
      return null
    } else if (param.type.startsWith('uint')) {
      let value = param.value
      if (value === '0') {
        if (key === 'limit') {
          return null
        } else if (key === 'gas') {
          value = '500000000'
        } else if (key === 'gasPrice') {
          value = '1'
        } else if (key === 'epochNumber') {
          return 'latest_state'
        } else if (key === 'fromEpoch') {
          return 'earliest'
        } else if (key === 'toEpoch') {
          return 'latest_mined'
        }
      }
      return `0x${BigInt(value).toString(16)}`
    }
    return param.value
  })
  if (asObject) {
    return Object.fromEntries(keys.map((k, i) => [k, values[i]]))
  } else {
    return values
  }
}

export default prepare