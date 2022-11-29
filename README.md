# NFT Recognition Script

The NFT Recognition Script is one of the most important puzzle pieces of the Blockchain Integration for the game. It allows, when requested from the game, to scan a specific user wallet, or a set of multiple users based on the condition triggering the script, and register in a database the amount of each NFTs they have, organized by the NFT’s SCs and then the number of each of those NFT.

Script Language: Node.Js
SC Language: Solidity


For this script, we need a “script” part, which will be made in different versions based on the triggering action, and a simple smart contract, that fetches the information from the user wallet. After reviewing the alternatives with Gabriele, we’ve decided that the fastest way for the smart contract to work will be this:

(1) Script triggers the smart contract, sending to the smart contract the user pubblic address.
(2) Smart Contract receives the user public address, and using a balanceOf function fetches the amount of each NFT.
(3) To know what NFT to look for, create an expandable array where we can store all the Smart Contract addresses of each NFT that we release. The Array must be expandable trough a function that allows us to append the newly created contracts, so that the SC is always up-to-date with the latest NFTs added to the game.


The frist triggering script you will be working on, which will collect the information extracted from the Smart Contract, will be a single wallet recognition script. To give you some context, this script will be called in-game when a user performs a transaction in the marketplace or in the item forge, so that we can update his inventory after he bought or crafted something.

For now, don’t worry about the actual game integration part, as it will be performed in a later stage during the merge phase. 

Here’s how the script should work:

(1) Script gets triggered from the game, with a payload containing the user public address (TBD) [for now use a manual trigger where you have to insert the public address to check]
(2) Scripts executes the smart contract and remains listening for the smart contract collected information
(3) Once the script receives the SC information, the information has to be stored in a Database (for now use the one of your preference). They have to be indexed in this way:



User Public Address
0x14da8jdkapmjkmio2847592029sdfsdf (Item Smart Contract)
1 (Quantity)
0xsdsd2412234gdfgsd23453453245sdf (Item Smart Contract)
4 (Quantity
And so on.

Once this is done, we will be working on more complex triggering scripts, that will execute in game in different conditions.

## Quickstart

1. Clone the repo
2. Run `yarn install`

## What’s Included?

- **[Hardhat](https://hardhat.org/)**: Ethereum development environment for professionals.
- **[Waffle](https://getwaffle.io/)**: The most advanced framework for testing smart contracts
- **[Typechain](https://github.com/ethereum-ts/TypeChain)**: TypeScript bindings for Ethereum smart contracts
- **[Tenderly](https://tenderly.co/)**: Real-time monitoring, alerting, and troubleshooting for Smart Contracts.
- **[Ethers]()**: A complete Ethereum wallet implementation and utilities in JavaScript (and TypeScript).
- **[Etherscan](https://etherscan.io)**: Verify contracts in The Ethereum Blockchain Explorer

#### Hardhat Plugins
- ABI Exporter
- Gas Reporter
- Contract Sizer
- OpenZeppelin Upgrades
## Usage

Look at the `package.json` inside scripts section to see available commands. A number of helper build scripts are located in `/scripts`.
### Build contracts

Compiles contracts and creates Typechain bindings.

`yarn build`

### Run tests

Runs all tests in the `/test` folder.

`yarn test`

### Run tests with gas report

Run all tests calculating gas estimations.

`yarn test:gas`

The gas report will be saved on the `/reports` folder.

### Deploy to Ethereum

Create/modify network config in hardhat.config.ts and add API key and private key, then run:

`npx hardhat run --network rinkeby scripts/deploy.ts`

### Verify on Etherscan

Using the hardhat-etherscan plugin, add Etherscan API key to hardhat.config.ts, then run:

`npx hardhat verify --network rinkeby <DEPLOYED ADDRESS>`
