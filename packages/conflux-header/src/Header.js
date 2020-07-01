import React, { PureComponent } from 'react'

import Navbar from '@obsidians/navbar'
import { NewProjectModal, navbarItem } from '@obsidians/conflux-project' 

import headerActions from './headerActions'

export default class Header extends PureComponent {
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

    const dropdownItems = starred.length
      ? starred.map(item => ({ id: item, name: <code>{item}</code> }))
      : [{ none: true }]
    const navbarRight = [
      {
        route: 'contract',
        title: 'Contract',
        icon: 'fa-file-invoice',
        selected: { id: selectedContract, name: selectedContract && <code>{selectedContract}</code> },
        dropdown: [{ header: 'starred' }, ...dropdownItems],
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
        selected: { id: selectedAccount, name: selectedAccount && <code>{selectedAccount}</code> },
        dropdown: [{ header: 'starred' }, ...dropdownItems],
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
