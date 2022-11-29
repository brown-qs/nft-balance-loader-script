// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SUSDC.sol";

/**
 * @dev Implementation of the Escrow Contract.
 *
 * Bonus: Modify the contract so that 20 people can bet on the outcomes together.
 * There will be a window for people to place bets, and they can either choose
 * option 1 or 2. The people in the winning group will split the rewards in the pool.
 * Each unique address can only have one vote.
 */
contract Escrow2 is Ownable {
    /**
     * @dev sUDFC Token for deposit and reward.
     */
    SUSDC public sUSDC;
    /**
     * @dev The flag for checking if the contract is settled or not.
     */
    bool public settled;
    /**
     * @dev The deposit amount users will deposit.
     */
    uint256 public depositAmount = 200_000_000_000_000_000_000;
    /**
     * @dev The deposit records.
     */
    mapping(address => bool) public deposited;
    address[] public option0Users;
    address[] public option1Users;

    /**
     * @dev Events for Escros.
     */
    event Deposit(address user, uint256 option);
    event Settle(uint256 option);

    /**
     * @dev Users should allow sUSDC to deposit
     *
     */
    modifier sUSDCAllowed() {
        require(sUSDC.allowance(msg.sender, address(this)) >= depositAmount, "SUSDC is not allowed for deposit.");
        _;
    }

    modifier onetimeDeposit() {
        require(!deposited[msg.sender], "Deposit is allowed only one time.");
        _;
    }

    /**
     * @dev Address shouldn't be zero address
     *
     */
    modifier nonZeroAddress(address address_) {
        require(address_ != address(0));
        _;
    }

    /**
     * @dev Constructor for Escrow Contract. The addresses of Alice and Bob should be given.
     *
     * @param sUSDC_ The Address of sUSDC Contract.
     */
    constructor(address sUSDC_) nonZeroAddress(sUSDC_) {
        sUSDC = SUSDC(sUSDC_);
    }

    /**
     * @dev Deposit Function for Escrow Contract. Users should allow the sUSDC for this contract.
     * Alice option should be 1 and Bob option should be 0
     *
     * @param option The deposit option for btc price (should be 0 or 1).
     */
    function deposit(uint256 option) external sUSDCAllowed onetimeDeposit {
        sUSDC.transferFrom(msg.sender, address(this), depositAmount);
        deposited[msg.sender] = true;
        if (option == 0) option0Users.push(msg.sender);
        else option1Users.push(msg.sender);

        emit Deposit(msg.sender, option);
    }

    /**
     * @dev Settle the Escrow
     * if option is 1, Alice wins, otherwise Bob wins
     *
     * @param option Settlement option (should be 0 or 1)
     */
    function settle(uint256 option) external onlyOwner {
        require(settled == false, "Already settled.");
        require(option0Users.length > 0, "No users deposited on option 0");
        require(option1Users.length > 0, "No users deposited on option 1");

        if (option == 0) {
            uint256 reward = (depositAmount * option1Users.length) / option0Users.length;
            for (uint256 i = 0; i < option0Users.length; i++) {
                sUSDC.transfer(option0Users[i], reward);
            }
        } else {
            uint256 reward = (depositAmount * option1Users.length) / option0Users.length;
            for (uint256 i = 0; i < option0Users.length; i++) {
                sUSDC.transfer(option0Users[i], reward);
            }
        }

        settled = true;
        emit Settle(option);
    }
}
