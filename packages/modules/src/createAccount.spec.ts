import { Chain } from '@zodiac/chains'
import { getDefaultProvider } from 'ethers'
import { AccountType } from 'ser-kit'
import { describe, expect, it } from 'vitest'
import { createAccount } from './createAccount'

describe('createAccount', () => {
  const ethProvider = getDefaultProvider(1)

  it('creates an EAO account if the passed address does not have code', async () => {
    const account = await createAccount(
      ethProvider,
      '0xd8da6bf26964af9d7eed9e03e53415d37aa96045', // vitalik's EOA address
    )

    expect(account).toEqual({
      type: AccountType.EOA,
      address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      prefixedAddress: `eoa:0xd8da6bf26964af9d7eed9e03e53415d37aa96045`,
    })
  })
  it('creates a Safe account if the passed address has code', async () => {
    const account = await createAccount(
      ethProvider,
      '0x849d52316331967b6ff1198e5e32a0eb168d039d', // Gnosis DAO active treasury mgmt Safe address
    )

    expect(account).toEqual({
      type: AccountType.SAFE,
      address: '0x849d52316331967b6ff1198e5e32a0eb168d039d',
      prefixedAddress: 'eth:0x849d52316331967b6ff1198e5e32a0eb168d039d',
      threshold: NaN,
      chain: Chain.ETH,
    })
  })
})
