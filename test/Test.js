
const { expect } = require("chai");
const { ethers } = require("hardhat");



describe("__TEST_CASES__", () => {

  let owner;
  let accounts;
  let contract;
  let collateralToken;
  const depositAmount = ethers.parseEther("10");
  const withdrawamount = ethers.parseEther("10");

  before(async () => {
    [owner, ...accounts] = await ethers.getSigners();


    /// Deploying USDC locally for testing only not forking and impersonating USDC from mainnet as contract does not have any mainnet interaction.
    const CollateralToken = await ethers.getContractFactory("USDC");
    collateralToken = await CollateralToken.deploy();

    const Contract = await ethers.getContractFactory("SyntheticAssetLeverage");
    contract = await Contract.deploy(collateralToken.target, 2, 1000);


    // console.log("USDC Address" , collateralToken.target);
    // console.log('Contract Address' , contract.target);



  })


  describe("__Deposite_function_test_cases__", () => {

    describe("__Failures__", () => {

      it("Should revert if the function is called with 0 collateral amount as param", async () => {

        await expect(contract.deposit(0)).to.be.revertedWith("ERR_0_AMOUNT");

      })
      it("Should revert if the tranfer from failed ", async () => {

        // await expect(contract.deposit(depositAmount)).to.be.revertedWith("");

      })

    })
    describe("__SUCCESS__", () => {
      it("Should map the user amount correctly for the collateral", async () => {
        await collateralToken.approve(contract.target, depositAmount);
        await contract.deposit(depositAmount);

        const userAccount = await contract.accounts(owner.address);
        expect(userAccount[0]).to.be.equal(depositAmount);
      })
    })
  })


  describe("__Withdraw_function_test_cases__", () => {

    describe("__Failures__", () => {

      it("Should revert if the function is called with 0 withdrawn amount as param", async () => {

        await expect(contract.withdraw(0)).to.be.revertedWith("ERR_INVALID_WITHDRAW_AMOUNT");

      })

      it("Should revert if the amount to withdraw is more than the current collateral amount in the contract", async () => {
        await expect(contract.withdraw("30000000000000000000")).to.be.revertedWith("ERR_INVALID_WITHDRAW_AMOUNT");

      })


    })
    describe("__SUCCESS__", () => {
      it("Should map the user amount correctly for the collateral after withdraw", async () => {
        await contract.withdraw(depositAmount);
        const userAccount = await contract.accounts(owner.address);
        expect(userAccount[0]).to.be.equal(0);
      })
    })
  })

  describe("__openPosition_function_test_cases__", () => {
    describe("__Failures__", () => {
      it("Should revert if the amount is zero", async () => {
        await expect(contract.openPosition(0, true)).to.be.revertedWith("ERR_INVALID_COLLATERAL_AMOUNT");

      })
      it("Should revert if the collateral amount is more than the current collateral amount", async () => {

        await collateralToken.approve(contract.target, depositAmount);
        await contract.deposit(depositAmount);

        await expect(contract.openPosition(ethers.parseEther("20"), true)).to.be.revertedWith("ERR_INVALID_COLLATERAL_AMOUNT");

      })
      it("Should revert if the synthetic asset amount is calculated as zero based on the current collateral amount", async () => {
        await expect(contract.openPosition(2, true)).to.be.revertedWith("ERR_INVALID_SYNTHETIC_ASSET_AMOUNT");

      })
    })

    describe("__SUCCESS__", () => {
      it("Should open the position successfully", async () => {
        await contract.openPosition(depositAmount, true);

      })

      it("Should reduce the collateral amount in the account", async () => {
        const userAccount = await contract.accounts(owner.address);
        expect(userAccount[0]).to.be.equal(0);
      })

      it('Should mark the synthetic asset in the user account', async () => {
        const userAccount = await contract.accounts(owner.address);
        expect(userAccount[1]).to.be.not.equal(0);


      })
      it('Should mark the leverage Multiplier as 2 in the user account', async () => {
        const userAccount = await contract.accounts(owner.address);
        expect(userAccount[2]).to.be.equal(2);


      })
    })
  })


  describe("__closePosition_function_test_cases__", () => {
    describe("__FAILURES__", () => {
      it("Should revert if the user do not have any synthetic asset and tries to close the position", async () => {
        await expect(contract.connect(accounts[1]).closePosition(depositAmount)).to.be.rejectedWith("ERR_INVALID_SYNTHETIC_ASSET_AMOUNT")
      })
    })

    describe("__SUCCESS__", () => {
      it("Should allow the user to close their position and increase the collateral balance", async () => {
        const account = await contract.accounts(owner.address);

        await contract.closePosition(account[1]);




        const accountRes = await contract.accounts(owner.address);


        expect(accountRes[0]).to.be.not.equal(0);
      })

      it("should make the synthetic asset price as zero when the position is closed", async () => {
        const accountRes = await contract.accounts(owner.address);
        expect(accountRes[1]).to.be.equal(0);
      })
    })
  })


  describe("__increaseLeverage_function_test_cases", () => {
    describe("__Failures__", () => {
      it("Should revert if the newLeverage is less than current leverage is entered as param", async () => {
        await expect(contract.increaseLeverage(1)).to.be.revertedWith("ERR_INVALID_MULTIPLIER");
      })
    })

    describe("__Success__", () => {
      it("Should allow the leverage to be increased", async () => {
        await contract.increaseLeverage(3);
        const account = await contract.accounts(owner.address);
        expect(account[2]).to.be.equal(3);
      })
    })
  })



  describe("__decreaseLeverage_function_test_cases", () => {
    describe("__Failures__", () => {

      it("Should revert if the newLeverage is more than current leverage is entered as param", async () => {
        await expect(contract.decreaseLeverage(4)).to.be.revertedWith("ERR_INVALID_MULTIPLIER");
      })

    })

    describe("__Success__", () => {
      it("Should allow the leverage to be decreased", async () => {
        await contract.decreaseLeverage(1);
        const account = await contract.accounts(owner.address);
        expect(account[2]).to.be.equal(1);
      })
    })
  })

  describe("__setSyntheticAssetPrice_function_test_cases", () => {


    describe("__Success__", () => {
      it("Should allow only the owner to change the price of the synthetic Asset", async () => {
        await contract.setSyntheticAssetPrice(2000);
        expect(await contract.syntheticAssetPrice()).to.be.equal(2000);

      })
    })
  })



})