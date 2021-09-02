const SponsoredCoin = artifacts.require('SponsoredCoin')

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(SponsoredCoin)
}
