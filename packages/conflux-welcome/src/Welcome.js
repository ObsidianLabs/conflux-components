import React, { PureComponent } from 'react'
import {
  Button,
  ListGroup,
} from '@obsidians/ui-components'

import fileOps from '@obsidians/file-ops'
import { ListItemDocker, ListItemDockerImage } from '@obsidians/docker'

import { instanceChannel } from '@obsidians/conflux-network'
import compiler from '@obsidians/conflux-compiler'

import checkDependencies from './checkDependencies'

export default class Welcome extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      ready: false
    }
    this.listItemDocker = React.createRef()
    this.listItemNode = React.createRef()
    this.listItemCompiler = React.createRef()
  }

  componentDidMount () {
    this.mounted = true
    this.refresh()
    fileOps.current.onFocus(this.refresh)
  }

  componentWillUnmount () {
    this.mounted = false
    fileOps.current.offFocus(this.refresh)
  }

  refresh = async () => {
    if (this.mounted) {
      this.listItemDocker.current.refresh()
      this.listItemNode.current.refresh()
      this.listItemCompiler.current.refresh()
      const ready = await checkDependencies()
      this.setState({ ready })
    }
  }

  render () {
    return (
      <div className='d-flex h-100 overflow-auto'>
        <div className='jumbotron jumbotron-fluid'>
          <div className='container'>
            <h4 className='display-4'>Welcome to Conflux Studio</h4>

            <p className='lead'>Conflux Studio is a graphic IDE for developing smart contracts on the Conflux blockchain.
            To get started, please install the prerequisite tools for Conflux.</p>

            <div className='my-3' />

            <ListGroup>
              <ListItemDocker
                ref={this.listItemDocker}
                onStartedDocker={this.refresh}
              />
              <ListItemDockerImage
                ref={this.listItemNode}
                channel={instanceChannel.node}
                title='Conflux Node in Docker'
                subtitle='Conflux node built into a docker image.'
                link='https://hub.docker.com/r/confluxchain/conflux-rust'
                onInstalled={this.refresh}
                downloadingTitle='Downloading Conflux'
              />
              <ListItemDockerImage
                ref={this.listItemCompiler}
                channel={compiler.cfxtruffle}
                title='Conflux Truffle in Docker'
                subtitle='A Conflux version of truffle used to create and compile a project.'
                link='https://hub.docker.com/r/obsidians/conflux-truffle'
                onInstalled={this.refresh}
                downloadingTitle='Downloading Conflux Truffle'
              />
            </ListGroup>
            <Button
              block
              color={this.state.ready ? 'primary' : 'secondary'}
              size='lg'
              className='my-5 mx-auto'
              style={{ width: 'fit-content' }}
              onClick={this.props.onGetStarted}
            >
              {this.state.ready ? 'Get Started' : 'Skip'}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
