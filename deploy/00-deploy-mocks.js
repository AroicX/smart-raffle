const { network, ethers } = require('hardhat')
const { developmentChains } = require('../helper-hardhat-config')

const BASE_FEE = ethers.parseEther("0.25")
const GAS_PRICE_LINK = 1e9;

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
 const chainId = network.config.chainId
    const args = [BASE_FEE, GAS_PRICE_LINK];
  log('network.name',network.name)
  // if (developmentChains.includes(network.name)) {
  if (chainId == 31337) {
    log('Local network detected...')

    // deploy a mock VRFCoordinatorV2Mock
    await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      args,
      log: true,
      waitConfirmations: network.config.blockConfirmations,
    })
      log("Mocks Deplyed!")
      log("----------------------------------")
  }
}
module.exports.tags = ["all", "mocks"]
