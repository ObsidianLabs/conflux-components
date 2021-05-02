export default {
  title: 'Gas & Storage',
  list: [
    {
      name: 'gas',
      className: 'col-4',
      label: 'Gas Limit',
      icon: 'fas fa-burn',
      placeholder: 'Default: 1,000,000',
      default: 1000000
    },
    {
      name: 'gasPrice',
      className: 'col-4',
      label: 'Gas Price',
      icon: 'fas fa-dollar-sign',
      placeholder: 'Default: 100 drip',
      default: 100
    },
    {
      name: 'storageLimit',
      className: 'col-4',
      icon: 'fas fa-hdd',
      label: 'Storage Limit'
    }
  ]
}
