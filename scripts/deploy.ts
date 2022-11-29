import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'
import { SUSDC__factory } from '../build/types'

const _500_ = ethers.BigNumber.from('500000000000000000000')
async function main() {
  const [, account1, account2, account3, account4, account5, account6] = await ethers.getSigners()

  const sUSDCFactory = (await ethers.getContractFactory('SUSDC')) as SUSDC__factory
  const sUSDCContract = await sUSDCFactory.deploy()
  // The address the Contract WILL have once mined
  console.log('sUSDC Contract Address:', sUSDCContract.address)
  // The transaction that was sent to the network to deploy the Contract
  console.log('sUSDC Contract Hash:', sUSDCContract.deployTransaction.hash)
  // The contract is NOT deployed yet; we must wait until it is mined
  await sUSDCContract.deployed()

  // Mint sUSDC
  await sUSDCContract.functions.transfer(account1.address, _500_)
  await sUSDCContract.functions.transfer(account2.address, _500_)
  await sUSDCContract.functions.transfer(account3.address, _500_)
  await sUSDCContract.functions.transfer(account4.address, _500_)
  await sUSDCContract.functions.transfer(account5.address, _500_)
  await sUSDCContract.functions.transfer(account6.address, _500_)

  const EscrowFactory = await ethers.getContractFactory('Escrow')
  const EscrowContract = await EscrowFactory.deploy(account1.address, account2.address, sUSDCContract.address)
  // The address the Contract WILL have once mined
  console.log('Escrow Contract Address:', EscrowContract.address)
  // The transaction that was sent to the network to deploy the Contract
  console.log('Escrow Contract Hash:', EscrowContract.deployTransaction.hash)
  // The contract is NOT deployed yet; we must wait until it is mined
  await EscrowContract.deployed()

  const Escrow2Factory = await ethers.getContractFactory('Escrow2')
  const Escrow2Contract = await Escrow2Factory.deploy(sUSDCContract.address)
  // The address the Contract WILL have once mined
  console.log('Escrow2 Contract Address:', Escrow2Contract.address)
  // The transaction that was sent to the network to deploy the Contract
  console.log('Escrow2 Contract Hash:', Escrow2Contract.deployTransaction.hash)
  // The contract is NOT deployed yet; we must wait until it is mined
  await Escrow2Contract.deployed()

  console.log('Contract Deployed')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
