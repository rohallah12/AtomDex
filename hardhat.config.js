
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
};

let ETHERSCAN_API_KEY = process.env.RINKEBY_API;
let PRIVATE_KEY = process.env.RINKEBY_PK;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
          chainId: 31337,
          // gasPrice: 130000000000,
      },
      goril: {
          url: "https://eth-goerli.g.alchemy.com/v2/0jBkfPuV3_iQgHwu9-y9BxeKn0cl-6_Q",
          accounts: [PRIVATE_KEY],
          chainId: 5,
          blockConfirmations: 6,
      },
      bsc: {
          url: "https://bsc-dataseed.binance.org/",
          accounts: [PRIVATE_KEY],
          chainId: 56,
          blockConfirmations: 2,
      },
  },
  solidity: {
      compilers: [
          {
              version: "0.8.8",
          },
      ],
  },
  etherscan: {
      apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
      deployer: {
          default: 0, // here this will by default take the first account as deployer
      },
      player1: {
        default : 1
      },
      player2: {
        default : 2
      },
      player3: {
        default: 3
      }
  },
}
