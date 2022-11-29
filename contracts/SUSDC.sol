// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @dev Implementation of the Basic ERC20 Contract.
 *
 * Deploy a standard ERC20 contract called (sUSDC) on a testnet of your choosing
 * and share the address with us. Mint some test tokens to two new addresses meant
 * to represent Alice and Bob.
 */
contract SUSDC is ERC20 {
    /**
     * @dev Deploy the ERC20 Standard Token with the name of sUSDC
     */
    constructor() ERC20("sUSDC", "sUSDC") {
        uint256 totalSupply_ = 1_000_000_000_000_000_000_000_000;
        _mint(msg.sender, totalSupply_);
    }
}
