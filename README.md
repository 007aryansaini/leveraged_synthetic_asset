# Contract Details

This contract allows users to open leveraged positions on a synthetic asset using a collateral token.
 Users can deposit collateral, open long or short positions, close positions, and adjust leverage.
 Leverage is used to determine the ratio of synthetic asset tokens that can be obtained per unit of collateral.
 Opening a position increases exposure to the synthetic asset, while closing a position reduces exposure.
 The synthetic asset price is assumed to be fixed for simplicity, and users can recover tokens other than the collateral token.
 Leverage can be increased but must be decreased cautiously to avoid liquidation risks.

 

 ### Contract address on BSC Testnet
 
- **BSC Testnet** : [`0x6fb4c4a7971bf19569ac44e70d0ede045a06ee1c`](https://testnet.bscscan.com/address/0x6fb4c4a7971bf19569ac44e70d0ede045a06ee1c)


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

### Test cases and gas cost screenshot

![Alt text](https://github.com/007aryansaini/leveraged_synthetic_asset/blob/main/TestCasesAndGasFees.png)
