import React, { Component } from 'react'
import {
  FormGroup,
  Label,
  DebouncedInput,
} from '@obsidians/ui-components'

// import DateTimePicker from '$common/DateTimePicker'
// import DebouncedInput from '$inputs/DebouncedInput'

export function ActionParamInput ({ type, value, onChange, placeholder, disabled, textarea, unit, children }) {
  const props = { value, onChange, disabled, placeholder: placeholder || type }
  return (
    <DebouncedInput size='sm' addon={children} {...props} />
  )
  //  else if (textarea) {
//     return (
//       <div style={{ position: 'relative' }}>
//         <DebouncedInput code type='textarea' size='sm' {...props} />
//         { unit && <Badge style={{ position: 'absolute', right: '5px', bottom: '5px', height: '18px', zIndex: 100 }}>{unit}</Badge> }
//       </div>
//     )
//   } else {
    // return <DebouncedInput size='sm' {...props} />
//   }
}

const paramInputIcons = {
  address: 'fas fa-map-marker-alt',
  uint256: 'fas fa-hashtag',
  name: 'fas fa-user-tag',
  account_name: 'fas fa-user-tag',
  bool: 'fas fa-check',
  asset: 'fas fa-coins',
  permission_level: 'fas fa-user-shield',
  public_key: 'fas fa-key',
  checksum256: 'fas fa-hashtag'
}
function units (type) {
  if (type === 'asset') {

    // return 'EOS';
  } else if (type.indexOf('[]') > -1) {
    return 'ARRAY'
  }
}

export default class ActionForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      args: props.fields?.map(({ value }) => value || '')
    }
  }

  componentDidMount () {
    if (this.props.args) {
      this.setState({ args: [...this.props.args] })
  }
  }

  componentWillReceiveProps (props) {
    if (props.action.name !== this.props.action.name) {
      this.setState({ args: props.fields.map(({ value }) => value || '') })
    }
  }

  // isTypeNumber = type => type.indexOf('int') > -1

  getData = () => {
    const data = {}
    this.props.fields.forEach(({ name }, index) => {
      data[name] = this.state.args[index]
    })
    return data
  }

  // getParsedData = () => {
  //   const data = {}
  //   this.props.fields.forEach(({ name }, index) => {
  //     const v = this.state.args[index]
  //     const type = this.props.fields[index].type
  //     try {
  //       if (type === 'string') {
  //         throw new Error()
  //       }
  //       const json = JSON.parse(`{"v":${v}}`)
  //       if (type === 'bool') {
  //         data[name] = !!json.v
  //       } else if (typeof json.v === 'number' && !this.isTypeNumber(type)) {
  //         data[name] = v
  //       } else {
  //         data[name] = json.v
  //       }
  //     } catch (e) {
  //       data[name] = v
  //     }
  //   })
  //   return data
  // }

  getValues = () => [...this.state.args]

  setArgValue = (value, index) => {
    const args = [...this.state.args]
    args[index] = value
    this.setState({ args })
  }

  // setArgs = newArgs => {
  //   const args = new Array(this.state.args.length)
  //   for (var i = 0; i < args.length; i++) {
  //     args[i] = newArgs[i]
  //   }
  //   this.setState({ args })
  // }

  // setData = data => {
  //   const args = [...this.state.args]
  //   this.props.fields.forEach(({ name }, index) => {
  //     if (typeof data[name] !== 'undefined') {
  //       args[index] = data[name]
  //     }
  //   })
  //   this.setState({ args })
  // }

  renderActionInput = (type, index, disabled) => {
    const value = this.state.args[index]
    // const unit = units(type)
    const onChange = value => this.setArgValue(value, index)
    const props = { type, value, onChange, disabled }

    const icon = paramInputIcons[type]
    if (icon) {
      return (
        <ActionParamInput {...props}>
          <a className='btn btn-sm btn-secondary w-5' key={icon}><i className={icon} /></a>
        </ActionParamInput>
      )
    }

    return type

  //   switch (type) {
  //     case 'bool':
  //       return (
  //         <ActionParamInput {...props}>
  //           <a className='btn btn-sm btn-secondary w-5 code px-0' style={{ fontWeight: 600, fontSize: '75%', lineHeight: 1.75 }}>bool</a>
  //         </ActionParamInput>
  //       )
  //     case 'uint8':
  //     case 'uint16':
  //     case 'uint32':
  //     case 'uint64':
  //     case 'int8':
  //     case 'int16':
  //     case 'int32':
  //     case 'int32?':
  //     case 'int64':
  //     case 'int64?':
  //     case 'uint128':
  //     case 'uint128?':
  //       return (
  //         <ActionParamInput {...props}>
  //           <a className='btn btn-sm btn-secondary w-5 code px-0' style={{ fontWeight: 600, fontSize: '75%', lineHeight: 1.75 }}>int</a>
  //         </ActionParamInput>
  //       )
  //     case 'symbol':
  //       return (
  //         <ActionParamInput {...props}>
  //           <a className='btn btn-sm btn-secondary w-5 code px-0' style={{ fontWeight: 600, fontSize: '75%', lineHeight: 1.75 }}>SYM</a>
  //         </ActionParamInput>
  //       )
  //     case 'authority':
  //       return <ActionParamInput textarea {...props} />
  //     case 'string':
  //       return <ActionParamInput textarea {...props} />
  //     case 'time_point_sec':
  //       return (
  //         <DateTimePicker
  //           onChange={datetime => {
  //             // convert from local to utc
  //             const utcDateString = datetime.utc().format('YYYY-MM-DDTHH:mm:ss')
  //             onChange(utcDateString)
  //           }}
  //         />
  //       )
  //     default:
  //       if (type.indexOf('[]') > -1) {
  //         return <ActionParamInput textarea {...props} />
  //       } else {
  //         return <ActionParamInput {...props} />
  //       }
  //   }
  }

  render () {
    console.debug('[render] ActionForm', this.props)

    const { action = {}, fields = [], Empty, disabled } = this.props

    if (!fields.length) {
      return Empty || null
    }

    return (
      <div>
        {fields.map(({ name, type, value }, index) => (
          <FormGroup key={`${action.name}-${name}-${index}`} className='mb-2'>
            {
              name
              ? <Label className='mb-1 small font-weight-bold'>{name}</Label>
              : <Label className='mb-1 small'>(None)</Label>
            }
            {this.renderActionInput(type, index, disabled || !!value)}
          </FormGroup>
        ))}
      </div>
    )
  }
}
