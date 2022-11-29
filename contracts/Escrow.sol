// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SUSDC.sol";

/**
 * @dev Implementation of the Escrow Contract.
 *
 * Alice and Bob wanted to enter into a bet on the price of Bitcoin by Christmas. Alice
 * believes that the price of bitcoin will be lower than $25,000, while Bob believes that the
 * price of bitcoin will be more than or equal to $25,000. They would both have to put the
 * same amount of funds into the contract.
 *
 * Create an escrow contract in Solidity that has the following functions:
 *   a. deposit(uint option) : Accepts deposits from Alice and Bob, along with a
 *      parameter called option . Assume that 0 is $BTC < 25,000, and 1 is $BTC ≥ 25,000
 *   b. settle(uint option) : Can only be called by the contract owner during maturity.
 *      The winner will receive all the funds from the contract.
 */
contract Escrow is Ownable {
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
     * @dev Address for Alice.
     */
    address alice;
    /**
     * @dev Address for Bob.
     */
    address bob;
    /**
     * @dev Mapping to check if user have deposited.
     */
    mapping(address => bool) deposited;

    /**
     * @dev Events for Escros.
     */
    event Deposit(address user, uint256 option);
    event Settle(uint256 option);

    /**
     * @dev Accept deposits from only Alice and Bob
     *
     */
    modifier onlyUsers() {
        require(msg.sender == alice || msg.sender == bob, "Only Alice and Bob can make a deposit.");
        _;
    }

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
     * @param alice_ The Address of Alice.
     * @param bob_ The Address of Bob.
     */
    constructor(
        address alice_,
        address bob_,
        address sUSDC_
    ) nonZeroAddress(alice_) nonZeroAddress(bob_) nonZeroAddress(sUSDC_) {
        require(alice_ != bob_, "Alice and Bob should be different.");
        alice = alice_;
        bob = bob_;
        sUSDC = SUSDC(sUSDC_);
    }

    /**
     * @dev Deposit Function for Escrow Contract. Users should allow the sUSDC for this contract.
     * Alice option should be 1 and Bob option should be 0
     *
     */
    function deposit() external onlyUsers sUSDCAllowed onetimeDeposit {
        sUSDC.transferFrom(msg.sender, address(this), depositAmount);
        deposited[msg.sender] = true;

        emit Deposit(msg.sender, msg.sender == alice ? 1 : 0);
    }

    /**
     * @dev Settle the Escrow
     * if option is 1, Alice wins, otherwise Bob wins
     *
     */
    function settle(uint256 option) external onlyOwner {
        require(settled == false, "Already settled.");
        require(deposited[alice], "Alice didn't make deposit yet.");
        require(deposited[bob], "Bob didn't make deposit yet.");

        address winner = alice;
        if (option == 0) {
            winner = bob;
        }

        sUSDC.transfer(winner, sUSDC.balanceOf(address(this)));
        settled = true;

        emit Settle(option);
    }
}
