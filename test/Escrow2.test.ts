import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Escrow2, Escrow2__factory, SUSDC, SUSDC__factory } from '../build/types'

// const _1_ = ethers.BigNumber.from('1000000000000000000')
// const _50_ = ethers.BigNumber.from('50000000000000000000')
// const _100_ = ethers.BigNumber.from('100000000000000000000')
// const _150_ = ethers.BigNumber.from('150000000000000000000')
const _200_ = ethers.BigNumber.from('200000000000000000000')
// const _300_ = ethers.BigNumber.from('300000000000000000000')
const _500_ = ethers.BigNumber.from('500000000000000000000')
const depositAmount = _200_

enum DepositOpton {
  SmallerThan25000 = 0,
  BiggerThan25000 = 1,
}

describe('Escrow2', function () {
  let account1: SignerWithAddress,
    account2: SignerWithAddress,
    account3: SignerWithAddress,
    account4: SignerWithAddress,
    account5: SignerWithAddress,
    account6: SignerWithAddress
  let SUSDCFactory: SUSDC__factory, susdc: SUSDC
  let EscrowwFactory: Escrow2__factory, escrow2: Escrow2

  beforeEach(async function () {
    const [, account1_, account2_, account3_, account4_, account5_, account6_] = await ethers.getSigners()
    account1 = account1_
    account2 = account2_
    account3 = account3_
    account4 = account4_
    account5 = account5_
    account6 = account6_

    SUSDCFactory = (await ethers.getContractFactory('SUSDC')) as SUSDC__factory
    susdc = await SUSDCFactory.deploy()
    await susdc.deployed()

    EscrowwFactory = (await ethers.getContractFactory('Escrow2')) as Escrow2__factory
    escrow2 = await EscrowwFactory.deploy(susdc.address)
    await escrow2.deployed()
  })

  const mintSUSDC = async () => {
    susdc.transfer(account1.address, _500_)
    susdc.transfer(account2.address, _500_)
    susdc.transfer(account3.address, _500_)
    susdc.transfer(account4.address, _500_)
    susdc.transfer(account5.address, _500_)
    susdc.transfer(account6.address, _500_)
  }

  const deposit = async (address: SignerWithAddress, option: DepositOpton) => {
    // Allow sUSDC into Escrow Contract
    await susdc.connect(address).increaseAllowance(escrow2.address, depositAmount)
    await escrow2.connect(address).deposit(option)
  }

  const bulkDeposit = async () => {
    await deposit(account1, DepositOpton.SmallerThan25000)
    await deposit(account2, DepositOpton.SmallerThan25000)
    await deposit(account3, DepositOpton.BiggerThan25000)
    await deposit(account4, DepositOpton.BiggerThan25000)
    await deposit(account5, DepositOpton.BiggerThan25000)
    await deposit(account6, DepositOpton.BiggerThan25000)
  }

  it('sUSDC should be allowed to make deposit.', async () => {
    await expect(escrow2.connect(account1).deposit(DepositOpton.BiggerThan25000)).to.be.revertedWith(
      'SUSDC is not allowed for deposit.',
    )
  })

  it('Deposit should be made after allowance.', async () => {
    // Mint sUSDC into alice and bob
    await mintSUSDC()

    // Allow sUSDC into Escrow Contract
    await deposit(account1, DepositOpton.BiggerThan25000)

    const balance = await susdc.balanceOf(escrow2.address)

    expect(balance).to.be.equal(depositAmount, 'Deposit amount is mismatching')
  })

  it("Double Deposit shouldn't be allowed", async () => {
    // Mint sUSDC into alice and bob
    await mintSUSDC()

    await deposit(account1, DepositOpton.SmallerThan25000)

    // await susdc.connect(account1).increaseAllowance(escrow.address, depositAmount)
    await expect(deposit(account1, DepositOpton.SmallerThan25000)).to.be.revertedWith(
      'Deposit is allowed only one time.',
    )
  })

  it('Deposit success for Multiple Users', async () => {
    // Mint sUSDC into alice and bob
    await mintSUSDC()

    await bulkDeposit()

    const balance = await susdc.balanceOf(escrow2.address)
    expect(balance).to.be.equal(depositAmount.mul(6), 'Deposit amount is mismatching')
  })

  it('Only owner can settle.', async () => {
    await expect(escrow2.connect(account1).settle(DepositOpton.SmallerThan25000)).to.be.reverted
  })

  it('Should be available to settle after deposit are made on both side.', async () => {
    await mintSUSDC()

    await expect(escrow2.settle(DepositOpton.SmallerThan25000)).to.be.revertedWith('No users deposited on option 0')

    await deposit(account1, DepositOpton.SmallerThan25000)
    await expect(escrow2.settle(DepositOpton.SmallerThan25000)).to.be.revertedWith('No users deposited on option 1')

    await deposit(account2, DepositOpton.BiggerThan25000)
    await escrow2.settle(DepositOpton.BiggerThan25000)

    const settled = await escrow2.settled()
    expect(settled).to.be.eq(true, 'Settled flag is not set.')
  })

  it('Check reward after settlement', async () => {
    await mintSUSDC()

    await bulkDeposit()

    const beforeBalance = await susdc.balanceOf(account1.address)
    await escrow2.settle(DepositOpton.SmallerThan25000)
    const afterBalance = await susdc.balanceOf(account1.address)

    expect(afterBalance).to.be.eq(beforeBalance.add(depositAmount.mul(4).div(2)), 'Reward amount mismatch.')
  })

  it('Cannot settle again after already settled', async () => {
    await mintSUSDC()

    await bulkDeposit()
    await escrow2.settle(DepositOpton.BiggerThan25000)

    await expect(escrow2.settle(DepositOpton.BiggerThan25000)).to.be.revertedWith('Already settled.')
  })
})
