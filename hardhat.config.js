require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  mocha: {
    timeout: 100000000,
  },



  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY,


},

  },
  networks: {
   
    bscTestnet: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      chainId: 97,
      accounts: [`0x${process.env.DEPLOYER_PRIVATE_KEY}`],
    },
   
  },
  gasReporter: {
    currency: "USD",
    gasPrice: 5,
    enabled: true,
    token: "BNB",
    coinmarketcap: process.env.COINMARTKETCAP_API,
  },
};