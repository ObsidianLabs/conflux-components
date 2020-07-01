import React, { PureComponent } from 'react'

import {
  Button,
  Badge,
} from '@obsidians/ui-components'

import NodeVersionModal from './NodeVersionModal'

export default class NodeVersionManager extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      nInstalled: ''
    }
    this.modal = React.createRef()
  }

  componentDidMount () {
    this.modal.current.refreshVersions()
  }

  onVersionRefreshed = versions => {
    this.setState({ nInstalled: versions.length })
  }

  onClickButton = () => {
    this.modal.current.openModal()
  }

  render () {
    const nInstalled = this.state.nInstalled

    return (
      <React.Fragment>
        <Button onClick={this.onClickButton}>
          <i className='fas fa-server mr-1' />
          Conflux Versions
          {
            nInstalled
              ? <Badge pill color='info' className='ml-1'>{nInstalled}</Badge>
              : null
          }
        </Button>
        <NodeVersionModal
          ref={this.modal}
          onVersionRefreshed={this.onVersionRefreshed}
        />
      </React.Fragment>
    )
  }
}
