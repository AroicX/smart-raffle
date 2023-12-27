const { network } = require('hardhat')
const { developmentChains, networkConfig } = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')

const VRF_SUB_FUND_AMOUNT = ethers.parseEther('1')

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  let vrfCoordinatorV2Address, subscriptionId
  const chainId = network.config.chainId

  // if (developmentChains.includes(network.name)) {
  if (chainId == 31337) {
    const VRFCoordinatorV2Mock = await ethers.getContract(
      'VRFCoordinatorV2Mock',
    )
    vrfCoordinatorV2Address = await VRFCoordinatorV2Mock.getAddress()
    const transRes = await VRFCoordinatorV2Mock.createSubscription()
    const transRec = await transRes.wait()
    subscriptionId = transRec.logs[0].args.subId
    await VRFCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT,
    )
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId]['vrfCoordinatorV2']
    subscriptionId = networkConfig[chainId]['subscriptionId']
  }

  const entranceFee = networkConfig[chainId]['raffleEntranceFee']
  const gasLane = networkConfig[chainId]['gasLane']
  const callbackGasLimit = networkConfig[chainId]['callbackGasLimit']
  const interval = networkConfig[chainId]['keepersUpdateInterval']
  //   const subscriptionId = networkConfig[chainId]['subscriptionId']
  const args = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callbackGasLimit,
    interval,
  ]
  const raffle = await deploy('Raffle', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log('Verifying...................')
    await verify(raffle.address, args)
    log('-------------------------------------')
  }
}

module.exports.tag = ['all', 'raffle']
