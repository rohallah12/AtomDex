const { ethers } = require("hardhat");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
  
    await deploy("CostumeERC20", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
    });
};
  
module.exports.tags = ["all"];