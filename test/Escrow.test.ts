import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { Escrow, Escrow__factory, SUSDC, SUSDC__factory } from '../build/types'

// const _1_ = ethers.BigNumber.from('1000000000000000000')
// const _50_ = ethers.BigNumber.from('50000000000000000000')
// const _100_ = ethers.BigNumber.from('100000000000000000000')
// const _150_ = ethers.BigNumber.from('150000000000000000000')
const _200_ = ethers.BigNumber.from('200000000000000000000')
// const _300_ = ethers.BigNumber.from('300000000000000000000')
const _500_ = ethers.BigNumber.from('500000000000000000000')
const depositAmount = _200_

describe('Escrow', function () {
  let alice: SignerWithAddress, bob: SignerWithAddress
  let SUSDCFactory: SUSDC__factory, susdc: SUSDC
  let EscrowFactory: Escrow__factory, escrow: Escrow

  beforeEach(async function () {
    const [, alice_, bob_] = await ethers.getSigners()
    alice = alice_
    bob = bob_

    SUSDCFactory = (await ethers.getContractFactory('SUSDC')) as SUSDC__factory
    susdc = await SUSDCFactory.deploy()
    await susdc.deployed()

    EscrowFactory = (await ethers.getContractFactory('Escrow')) as Escrow__factory
    escrow = await EscrowFactory.deploy(alice.address, bob.address, susdc.address)
    await escrow.deployed()
  })

  const mintSUSDC = async () => {
    susdc.transfer(alice.address, _500_)
    susdc.transfer(bob.address, _500_)
  }

  const depositAlice = async () => {
    // Allow sUSDC into Escrow Contract
    await susdc.connect(alice).increaseAllowance(escrow.address, depositAmount)
    await escrow.connect(alice).deposit()
  }

  const depositBob = async () => {
    // Allow sUSDC into Escrow Contract
    await susdc.connect(bob).increaseAllowance(escrow.address, depositAmount)
    await escrow.connect(bob).deposit()
  }

  it('Accept Deposits from only Alice and Bob.', async () => {
    await expect(escrow.deposit()).to.be.revertedWith('Only Alice and Bob can make a deposit.')
  })

  it('sUSDC should be allowed to make deposit.', async () => {
    await expect(escrow.connect(alice).deposit()).to.be.revertedWith('SUSDC is not allowed for deposit.')
  })

  it('Deposit should be made after allowance.', async () => {
    // Mint sUSDC into alice and bob
    await mintSUSDC()

    // Allow sUSDC into Escrow Contract
    await depositAlice()

    const balance = await susdc.balanceOf(escrow.address)

    expect(balance).to.be.equal(depositAmount, 'Deposit amount is mismatching')
  })

  it("Double Deposit shouldn't be allowed", async () => {
    // Mint sUSDC into alice and bob
    await mintSUSDC()
    await depositAlice()
    await expect(depositAlice()).to.be.revertedWith('Deposit is allowed only one time.')
  })

  it('Deposit success for both Alice and Bob', async () => {
    // Mint sUSDC into alice and bob
    await mintSUSDC()

    await depositAlice()
    await depositBob()

    const balance = await susdc.balanceOf(escrow.address)

    expect(balance).to.be.equal(depositAmount.mul(2), 'Deposit amount is mismatching')
  })

  it('Only owner can settle.', async () => {
    await expect(escrow.connect(alice).settle(0)).to.be.reverted
  })

  it('Should be available to settle after deposit are made.', async () => {
    await mintSUSDC()

    await expect(escrow.settle(0)).to.be.revertedWith("Alice didn't make deposit yet.")

    await depositAlice()
    await expect(escrow.settle(0)).to.be.revertedWith("Bob didn't make deposit yet.")

    await depositBob()
    await escrow.settle(0)

    const settled = await escrow.settled()
    expect(settled).to.be.eq(true, 'Settled flag is not set.')
  })

  it('Check reward after settlement', async () => {
    await mintSUSDC()

    await depositAlice()
    await depositBob()

    const beforeBobBalance = await susdc.balanceOf(bob.address)
    const beforeContractBalance = await susdc.balanceOf(escrow.address)
    await escrow.settle(0)

    const susdcBalance = await susdc.balanceOf(escrow.address)
    expect(susdcBalance).to.be.eq(0, 'sUSDC is not transfered to winner.')

    const afterBobBalance = await susdc.balanceOf(bob.address)
    expect(afterBobBalance).to.be.eq(beforeBobBalance.add(beforeContractBalance), "Winner didn't get full reward.")
  })

  it('Cannot settle again after already settled', async () => {
    await mintSUSDC()

    await depositAlice()
    await depositBob()
    await escrow.settle(0)

    await expect(escrow.settle(0)).to.be.revertedWith('Already settled.')
  })
})
