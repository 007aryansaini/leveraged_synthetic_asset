const hre = require("hardhat");

const USDC_ADDRESS = "0x64544969ed7EBf5f083679233325356EbE738930";


const deploy = async () => {
  const contract = await hre.ethers.deployContract("SyntheticAssetLeverage", [
     USDC_ADDRESS,
     2,
     1000
  ]);
  await contract.waitForDeployment();
  console.log(
    `Contract deployed on '${hre.network.name}' at: ${contract.target}`
  );




  /// @dev Verifying the stable coin smart contract.
  if (hre.network.name !== "hardhat") {
  await  contract.waitForDeployment(6);
    await hre.run("verify:verify", {
      address: contract.target,
      constructorArguments: [USDC_ADDRESS , 2 , 1000],
    });
  }
};

deploy().catch((e) => console.log(e));