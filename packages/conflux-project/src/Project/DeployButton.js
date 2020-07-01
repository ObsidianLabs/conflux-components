import React, { PureComponent } from 'react'

import {
  Modal,
  Button,
  UncontrolledTooltip
} from '@obsidians/ui-components'

import notification from '@obsidians/notification'

import Highlight from 'react-highlight'

import projectManager from '../projectManager'

export default class DeployerButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      pending: false,
      result: '',
    }
    this.modal = React.createRef()
  }

  onClick = async () => {
    if (this.state.pending) {
      return
    }

    this.setState({ pending: true, result: '' })
    this.notification = notification.info(`Deploying...`, ``, 0)

    try {
      const result = await projectManager.deploy()
      this.setState({ result: JSON.stringify(result, null, 2) })
      this.notification.dismiss()
      notification.success('Deploy Successful')
      this.modal.current.openModal()
    } catch (e) {
      this.notification.dismiss()
      notification.error('Deploy Failed', e.message)
    }
    this.setState({ pending: false })
  }

  renderDeployResult = () => {
    return (
      <Highlight
        language='javascript'
        className='pre-box pre-wrap break-all small'
        element='pre'
      >
        {this.state.result}
      </Highlight>
    )
  }

  render () {
    let icon = <span key='deploy-icon'><i className='fab fa-docker' /></span>
    if (this.state.pending) {
      icon = <span key='deploying-icon'><i className='fas fa-spinner fa-spin' /></span>
    }

    return (
      <React.Fragment>
        <Button
          size='sm'
          color='default'
          id='toolbar-btn-deploy'
          key='toolbar-btn-deploy'
          className='rounded-0 border-0 flex-none px-2 w-5 flex-column align-items-center'
          onClick={this.onClick}
        >
          {icon}
        </Button>
        <UncontrolledTooltip trigger='hover' delay={0} placement='bottom' target='toolbar-btn-deploy'>
          { this.state.pending ? 'Deploying' : `Deploy`}
        </UncontrolledTooltip>
        <Modal
          ref={this.modal}
          title='Deployment Result'
          textCancel='Close'
        >
          {this.renderDeployResult()}
        </Modal>
      </React.Fragment>
    )
  }
}