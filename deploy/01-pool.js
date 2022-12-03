const { ethers } = require("hardhat");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const token = await ethers.getContract("AtomToken", deployer);

    await deploy("PoolV1", {
      from: deployer,
      args: [token.address],
      log: true,
      waitConfirmations: 1,
    });
  };
  
  module.exports.tags = ["all"];