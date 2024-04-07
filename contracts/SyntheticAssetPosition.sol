  
/// @title Synthetic Asset Leverage Smart Contract
  
// SPDX-License-Identifier: MIT
  
pragma solidity 0.8.20;

  
/// @dev Importing openzeppelin stuffs.
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Contract Logic Overview
/// This contract allows users to open leveraged positions on a synthetic asset using a collateral token.
/// Users can deposit collateral, open long or short positions, close positions, and adjust leverage.
/// Leverage is used to determine the ratio of synthetic asset tokens that can be obtained per unit of collateral.
/// Opening a position increases exposure to the synthetic asset, while closing a position reduces exposure.
/// The synthetic asset price is assumed to be fixed for simplicity, and users can recover tokens other than the collateral token.
/// Leverage can be increased but must be decreased cautiously to avoid liquidation risks.
contract SyntheticAssetLeverage is Ownable {
    /// @dev collateralToken to intialize ERC20 token instance
    IERC20 public collateralToken;

    /// @dev syntheticAssetPrice: To feed the price of the synthetic asset.
    uint256 public syntheticAssetPrice;

    /// @dev State variable to manage leverage Multiplier for the contract
    uint256 public leverageMultiplier;

    /// @dev struct to manage the user Account Detaiils
    struct Account {
        uint256 collateralBalance; // To track the amount of collateral deposited by the user
        uint256 syntheticAssetPosition; // To track the current synthetic posisition of the user
        uint256 leverageMultiplier; // To track user current leverage
    }

    /// @dev mapping to map address to account
    mapping(address => Account) public accounts;

    /// @dev Events
    /**
     * `Deposit` will be fired when someone deposit collateral.
     * @param account: The address of the wallet who depoosit collateral.
     * @param amount: The amount of collateral deposited.
     */
    event Deposit(address indexed account, uint256 amount);

    /**
     * `Withdrawal` will be fired when someone withdraw collateral
     * @param account: The address of the wallet who depoosit collateral.
     * @param amount: The amount of collateral withdrawal.
     */
    event Withdrawal(address indexed account, uint256 amount);

    /**
     * `OpenPosition` will be fired when a user open a position
     * @param account: The address of the wallet who opens the posotion.
     * @param collateralAmount: The amount of collateral used to open position.
     * @param syntheticAssetAmount: The amount of synthetic asset received.
     * @param isLong: isLong or short
     */
    event OpenPosition(
        address indexed account,
        uint256 collateralAmount,
        uint256 syntheticAssetAmount,
        bool isLong
    );

    /**
     * `ClosePosition` will be fired when a user closes a position
     * @param account: The address of the wallet who opens the posotion.
     * @param collateralAmount: The amount of collateral after closing position.
     * @param syntheticAssetAmount: The amount of synthetic asset after closing position.
     */
    event ClosePosition(
        address indexed account,
        uint256 collateralAmount,
        uint256 syntheticAssetAmount
    );

    /// @dev Constructor to initialize the contract
    constructor(
        address _collateralToken,
        uint256 _leverageMultiplier,
        uint256 _syntheticAssetPrice
    ) Ownable(msg.sender) {
        /// @dev initializing the state variables
        collateralToken = IERC20(_collateralToken);
        leverageMultiplier = _leverageMultiplier;
        syntheticAssetPrice = _syntheticAssetPrice;
    }

    /**
     * @dev Function to deposit collateral.
     * @param _amount : The amount of collateral to deposit
     */
    function deposit(uint256 _amount) external {
        require(_amount > 0, "ERR_0_AMOUNT");
        require(
            collateralToken.transferFrom(msg.sender, address(this), _amount),
            "ERR_TRANSFER_FAILED"
        );
        accounts[msg.sender].collateralBalance += _amount;
        emit Deposit(msg.sender, _amount);
    }

    /**
     * @dev Function to withdraw collateral.
     * @param _amount : The amount of collateral to withdraw
     */
    function withdraw(uint256 _amount) external {
        require(
            _amount > 0 && _amount <= accounts[msg.sender].collateralBalance,
            "ERR_INVALID_WITHDRAW_AMOUNT"
        );
        accounts[msg.sender].collateralBalance -= _amount;
        require(
            collateralToken.transfer(msg.sender, _amount),
            "ERR_TRANSFER_FAILED"
        );

        emit Withdrawal(msg.sender, _amount);
    }

    /**
     * @dev Function to OPEN POSITION.
     * @param _collateralAmount : The amount of collateral used to open position for
     * @param _isLong : The position open is long or short
     */
    function openPosition(uint256 _collateralAmount, bool _isLong) external {
        Account storage account = accounts[msg.sender];
        require(
            _collateralAmount > 0 &&
                _collateralAmount <= account.collateralBalance,
            "ERR_INVALID_COLLATERAL_AMOUNT"
        );

        // Set initial leverage multiplier if not set yet
        if (account.leverageMultiplier == 0) {
            account.leverageMultiplier = leverageMultiplier;
        }

        uint256 syntheticAssetAmount = (_collateralAmount *
            account.leverageMultiplier) / syntheticAssetPrice;
        require(syntheticAssetAmount > 0, "ERR_INVALID_SYNTHETIC_ASSET_AMOUNT");

        if (_isLong) {
            account.syntheticAssetPosition += syntheticAssetAmount;
        } else {
            require(
                syntheticAssetAmount <= account.syntheticAssetPosition,
                "ERR_NOT_SUFFICIENT_POSITION_TO_COVER"
            );
            account.syntheticAssetPosition -= syntheticAssetAmount;
        }

        account.collateralBalance -= _collateralAmount;
        emit OpenPosition(
            msg.sender,
            _collateralAmount,
            syntheticAssetAmount,
            _isLong
        );
    }

    /**
     * @dev Function to close position.
     * @param _syntheticAssetAmount : The amount of synthetic asset to close position for
     */
    function closePosition(uint256 _syntheticAssetAmount) external {
        Account storage account = accounts[msg.sender];
        require(
            _syntheticAssetAmount > 0 &&
                _syntheticAssetAmount <= account.syntheticAssetPosition,
            "ERR_INVALID_SYNTHETIC_ASSET_AMOUNT"
        );
        uint256 collateralAmount = (_syntheticAssetAmount *
            syntheticAssetPrice) / account.leverageMultiplier;

        account.syntheticAssetPosition -= _syntheticAssetAmount;
        account.collateralBalance += collateralAmount;
        emit ClosePosition(msg.sender, collateralAmount, _syntheticAssetAmount);
    }

    /**
     * @dev Function to increase leverage.
     * @param _newMultiplier : The new leverage multiplier to set
     */
    function increaseLeverage(uint256 _newMultiplier) external {
        require(_newMultiplier > leverageMultiplier, "ERR_INVALID_MULTIPLIER");
        accounts[msg.sender].leverageMultiplier = _newMultiplier;
    }

    /**
     * @dev Function to decrease leverage.
     * @param _newMultiplier : The new leverage multiplier to set
     */
    function decreaseLeverage(uint256 _newMultiplier) external {
        require(_newMultiplier < leverageMultiplier, "ERR_INVALID_MULTIPLIER");
        accounts[msg.sender].leverageMultiplier = _newMultiplier;
    }

    /**
     * @dev Function to set synthetic asset price.
     * @param _price : The new synthetic asset price to set
     */
    function setSyntheticAssetPrice(uint256 _price) external onlyOwner {
        syntheticAssetPrice = _price;
    }
}
