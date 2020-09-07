import React, { PureComponent } from 'react'

import Navbar from '@obsidians/navbar'
import keypairManager from '@obsidians/keypair'
import { NewProjectModal, navbarItem } from '@obsidians/conflux-project' 

import headerActions from './headerActions'

export default class Header extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      keypairs: []
    }
  }

  componentDidMount () {
    keypairManager.loadAllKeypairs().then(this.updateKeypairs)
    keypairManager.onUpdated(this.updateKeypairs)
  }

  updateKeypairs = keypairs => this.setState({ keypairs })

  render () {
    const {
      projects,
      selectedProject,
      starred,
      selectedContract,
      selectedAccount,
      network,
      networkList,
      compilerVersion,
    } = this.props

    const navbarLeft = [
      navbarItem(projects, selectedProject)
    ]

    const dropdownKeypairs = this.state.keypairs.map(k => ({ id: k.address, name: k.name || <code>{k.address.substr(0, 6)}...{k.address.substr(-4)}</code> }))
    dropdownKeypairs.unshift({ header: 'keypair manager' })
    if (!dropdownKeypairs.length) {
      dropdownKeypairs.push({ none: true })
    }
    const dropdownStarred = starred.map(item => ({ id: item, name: <code>{item.substr(0, 6)}...{item.substr(-4)}</code> }))
    const dropdownStarredInContract = [{ header: 'starred' }, ...dropdownStarred]
    if (dropdownStarred.length) {
      dropdownStarred.unshift({ header: 'starred' })
      dropdownStarred.unshift({ divider: true })
    } else {
      dropdownStarredInContract.push({ none: true })
    }

    const accountName = selectedAccount && (this.state.keypairs.find(k => k.address === selectedAccount)?.name || <code>{selectedAccount}</code>)

    const navbarRight = [
      {
        route: 'contract',
        title: 'Contract',
        icon: 'fa-file-invoice',
        selected: { id: selectedContract, name: selectedContract && <code>{selectedContract}</code> },
        dropdown: dropdownStarredInContract,
        onClickItem: selected => headerActions.selectContract(network.id, selected),
        contextMenu: () => [{
          text: 'Remove from Starred',
          onClick: ({ id }) => headerActions.removeFromStarred(network.id, id),
        }],
      },
      {
        route: 'account',
        title: 'Explorer',
        icon: 'fa-file-invoice',
        selected: { id: selectedAccount, name: accountName },
        dropdown: [...dropdownKeypairs, ...dropdownStarred],
        onClickItem: selected => headerActions.selectAccount(network.id, selected),
        contextMenu: () => [{
          text: 'Remove from Starred',
          onClick: ({ id }) => headerActions.removeFromStarred(network.id, id),
        }],
      },
      {
        route: 'network',
        title: 'Network',
        icon: network.icon,
        selected: network,
        dropdown: networkList,
        onClickItem: newtorkId => headerActions.setNetwork(newtorkId),
      },
    ]

    return (
      <React.Fragment>
        <Navbar
          navbarLeft={navbarLeft}
          navbarRight={navbarRight}
        />
        <NewProjectModal compilerVersion={compilerVersion} />
      </React.Fragment>
    )
  }
}
