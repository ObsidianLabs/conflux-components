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

export function ActionParamInput ({ size, type, value, onChange, placeholder, disabled, textarea, unit, children }) {
  const props = { value, onChange, disabled, placeholder: placeholder || type }
  
  if (type && type.endsWith('[]')) {
    return (
      <ArrayInput
        size={size}
        addon={children}
        type={type}
        textarea={textarea}
        onChange={onChange}
      />
    )
  } else if (textarea) {
    return (
      <div style={{ position: 'relative' }}>
        <DebouncedInput type='textarea' size={size} {...props} />
        { unit && <Badge style={{ position: 'absolute', right: '5px', bottom: '5px', height: '18px', zIndex: 100 }}>{unit}</Badge> }
      </div>
    )
  } else {
    return (
      <DebouncedInput size={size} addon={children} {...props} />
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

export default class ContractForm extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      args: props.inputs?.map(({ value }) => value || '') || []
    }
  }

  componentDidMount () {
    if (this.props.args) {
      this.setState({ args: [...this.props.args] })
  }
  }

  componentWillReceiveProps (props) {
    if (props.inputs !== this.props.inputs) {
      this.setState({ args: props.inputs?.map(({ value }) => value || '') || [] })
    }
  }

  getData = () => {
    const data = {}
    this.props.inputs.forEach(({ name, type }, index) => {
      data[name] = this.state.args[index]
    })
    return data
  }

  getValues = () => {
    const values = []
    this.props.inputs.forEach(({ name, type }, index) => {
      const value = this.state.args[index]
      if (type && type.endsWith('[]')) {
        values.push(value ? value.map(item => item.value) : [])
      } else if (type && type.startsWith('bytes')) {
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

  renderActionInput = (type, index, disabled) => {
    const value = this.state.args[index]
    // const unit = units(type)
    const onChange = value => this.setArgValue(value, index)
    const props = { size: this.props.size, type, value, onChange, disabled }

    const icon = paramInputIcons[type]
    if (icon) {
      return (
        <ActionParamInput {...props}>
          <span key={icon}><i className={icon} /></span>
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
          <span key={`icon-${index}`}><i className='fas fa-brackets' /></span>
        </ActionParamInput>
      )
    } else if (icon) {
      return (
        <ActionParamInput {...props}>
          <span key={`icon-${index}`}><i className={icon} /></span>
        </ActionParamInput>
      )
    }
    return type
  }

  render () {
    console.debug('[render] ContractForm', this.props)

    const { size, name: methodName, inputs = [], Empty, disabled } = this.props

    if (!inputs.length) {
      return Empty || null
    }

    return (
      <div>
        {inputs.map(({ name, type, value }, index) => (
          <FormGroup key={`${methodName}-${index}`} className={size === 'sm' && 'mb-2'}>
            {
              name
              ? <Label className={size === 'sm' && 'mb-1 small font-weight-bold'}>{name}</Label>
              : <Label className={size === 'sm' && 'mb-1 small'}>(None)</Label>
            }
            {this.renderActionInput(type, index, disabled || !!value)}
          </FormGroup>
        ))}
      </div>
    )
  }
}