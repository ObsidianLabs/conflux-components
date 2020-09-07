import React, { PureComponent } from 'react'
import {
  FormGroup,
  Label,
  DebouncedInput,
  Badge,
  MultiSelect,
  Modal,
} from '@obsidians/ui-components'

import { util } from 'js-conflux-sdk'

const optionItemFromValue = (value, type) => {
  let icon = null
  let label = value.length > 10 ? `${value.substr(0, 8)}...` : value

  // if (format === 'file') {
  //   icon = <i className='fas fa-file mr-1' />
  //   label = fileOps.current.path.parse(value).base
  // } else if (format === 'utf8') {
  //   icon = <i className='fas fa-font-case mr-1'/>
  // } else if (format === 'hex') {
  //   icon = <i className='fas fa-code mr-1'/>
  // }

  return {
    value,
    label: <span key={`arg-${type}`}>{icon}{label}</span>
  }
}

export class ArrayInput extends PureComponent {
  constructor (props) {
    super(props)

    this.modal = React.createRef()
    this.input = React.createRef()
    
    this.state = {
      values: props.value || [],
      data: '',
      title: '',
      errorInData: false,
    }

    this.options = [
      {
        label: 'Add Item',
        options: [
          { label: 'Enter...', getValue: this.enterNewItem },
        ]
      }
    ]
  }
  
  enterNewItem = async () => {
    this.setState({ newValue: '', title: 'Enter a New Item' })
    this.modal.current.openModal()
    setTimeout(() => this.input.current.focus(), 100)
    return new Promise(resolve=> this.onResolve = resolve)
  }

  onClickItem = async ({ value }) => {
    this.setState({ newValue: value, title: 'Modiry an Item' })
    this.modal.current.openModal()
    setTimeout(() => {
      this.input.current.focus()
    }, 100)
    return new Promise(resolve=> this.onResolve = resolve)
  }

  onConfirm = () => {
    this.onResolve(optionItemFromValue(this.state.newValue, this.props.type))
    this.setState({ newValue: '' })
    this.modal.current.closeModal()
  }

  onChange = values => {
    this.setState({ values })
    this.props.onChange(values)
  }

  render () {
    const {
      size,
      addon,
      type,
      textarea,
    } = this.props
    return (
      <React.Fragment>
        <MultiSelect
          size={size}
          addon={addon}
          options={this.options}
          value={this.state.values}
          onChange={this.onChange}
          onClickLabel={this.onClickItem}
        />
        <Modal
          ref={this.modal}
          title={this.state.title}
          onConfirm={this.onConfirm}
          confirmDisabled={this.state.errorInData}
        >
          <DebouncedInput
            ref={this.input}
            textarea={textarea}
            placeholder={type}
            value={this.state.newValue}
            onChange={newValue => this.setState({ newValue })}
          />
        </Modal>
      </React.Fragment>
    )
  }
}

export function ActionParamInput ({ type, value, onChange, placeholder, disabled, textarea, unit, children }) {
  const props = { value, onChange, disabled, placeholder: placeholder || type }
  
  if (type.endsWith('[]')) {
    return (
      <ArrayInput
        size='sm'
        addon={children}
        type={type}
        textarea={textarea}
        onChange={onChange}
      />
    )
  } else if (textarea) {
    return (
      <div style={{ position: 'relative' }}>
        <DebouncedInput type='textarea' size='sm' {...props} />
        { unit && <Badge style={{ position: 'absolute', right: '5px', bottom: '5px', height: '18px', zIndex: 100 }}>{unit}</Badge> }
      </div>
    )
  } else {
    return (
      <DebouncedInput size='sm' addon={children} {...props} />
    )
  }
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

export default class ActionForm extends PureComponent {
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
    this.props.fields.forEach(({ name, type }, index) => {
      // if (type === 'bytes32') {
      //   data[name] = Utils.stringToByte32(this.state.args[index]).getValue()
      // } else if (type === 'bytes8') {
      //   data[name] = Utils.stringToByte8(this.state.args[index]).getValue()
      // }
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

  getValues = () => {
    const values = []
    this.props.fields.forEach(({ name, type }, index) => {
      const value = this.state.args[index]
      if (type.endsWith('[]')) {
        values.push(value ? value.map(item => item.value) : [])
      } else if (type.startsWith('bytes')) {
        const length = Number(type.substr(5))
        const bytes = util.format.bytes(value)
        if (bytes.length > length) {
          throw new Error(`Byte length overflow for parameter <b>${name}</b>. Expect ${length} but got ${bytes.length}.`)
        }
        const arr = new Uint8Array(length)
        arr.set(bytes)
        values.push(arr)
      } else {
        values.push(value)
      }
    })
    return values
  }

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

    if (type.startsWith('bytes')) {
      return (
        <ActionParamInput {...props} textarea unit='UTF8'/>
      )
    } else if (type.endsWith('[]')) {
      return (
        <ActionParamInput {...props}>
          <a className='btn btn-sm btn-secondary w-5' key={`icon-${index}`}><i className='fas fa-brackets' /></a>
        </ActionParamInput>
      )
    } else if (icon) {
      return (
        <ActionParamInput {...props}>
          <a className='btn btn-sm btn-secondary w-5' key={`icon-${index}`}><i className={icon} /></a>
        </ActionParamInput>
      )
    }
    return type

      // case 'bool':
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
    //   default:
        
    // }
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
