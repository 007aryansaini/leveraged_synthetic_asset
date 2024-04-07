# Stable Coin ( nUSD )

This is a Stable Coin which is minted based on the price of ETH/BNB that is fetched from oracle.
It allows users to deposit ETH/BNB and receive 50% of its value in nUSD.
The amount of nUSD required to convert to ETH is double the value.

## Some important Steps before running below commands

### Install node modules required for this project

```shell
npm i
```

Make sure to have .env file with 3 variables that hold your privateKey, BscScan Api key and Coin Market Cap api key with name same as below:

1. [BSCSCAN_API = "Your_API_Key"]()
2. [COINMARTKETCAP_API = "Your_API_Key"]()
3. [DEPLOYER_PRIVATE_KEY = "Your_API_Key"]()

### To Compile smart contract

```shell
npx hardhat compile
```

### To Deploy smart Contract on bscTestnet

```shell
npx hardhat run --network bscTestnet scripts/deploy.js
```

### To Run testing script for smart contract

```shell
npx hardhat test
```

![Alt text]("https://github.com/007aryansaini/leveraged_synthetic_asset/blob/main/TestCasesAndGasFees.png")