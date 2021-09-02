const ERC777GLDToken = artifacts.require('ERC777GLDToken')

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(ERC777GLDToken, 1000000, [accounts[0]])
}
