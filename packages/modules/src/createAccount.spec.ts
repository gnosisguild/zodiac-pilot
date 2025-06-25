import { Chain } from '@zodiac/chains'
import { AlchemyProvider } from 'ethers'
import { AccountType, prefixAddress } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { createAccount } from './createAccount'

describe('createAccount', () => {
  const ethProvider = new AlchemyProvider(
    Chain.ETH,
    process.env.ALCHEMY_API_KEY,
  )

  it('creates an EAO account if the passed address does not have code', async () => {
    const vitalikEoaAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

    const account = await createAccount(ethProvider, vitalikEoaAddress)

    expect(account).toEqual({
      type: AccountType.EOA,
      address: vitalikEoaAddress,
      prefixedAddress: prefixAddress(undefined, vitalikEoaAddress),
    })
  })
  it('creates a Safe account if the passed address has code', async () => {
    const gnosisDaoTreasury = '0x849d52316331967b6ff1198e5e32a0eb168d039d'

    const account = await createAccount(ethProvider, gnosisDaoTreasury)

    expect(account).toEqual({
      type: AccountType.SAFE,
      address: gnosisDaoTreasury,
      prefixedAddress: prefixAddress(Chain.ETH, gnosisDaoTreasury),
      threshold: NaN,
      chain: Chain.ETH,
    })
  })
})
