import test, { expect } from '@playwright/test'
import { encode } from '@zodiac/schema'
import { mockWeb3 } from '@zodiac/test-utils/e2e'
import { href } from 'react-router'
import { getAddress } from 'viem'
import { connectWallet } from '../connectWallet'
import { account, route, transaction } from './fixture'

test.describe('Locked account', () => {
  test('handles wallet disconnect gracefully', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
      chain: 'gnosis',
    })

    await page.goto(
      href('/submit/:route/:transactions', {
        route: encode(route),
        transactions: encode([transaction]),
      }),
    )

    await connectWallet(page, account)
    await lockWallet()

    await expect(
      page.getByRole('alert', { name: 'Wallet disconnected' }),
    ).toBeInViewport()
  })

  test('it is possible to reconnect an account', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
      chain: 'gnosis',
    })

    await page.goto(
      href('/submit/:route/:transactions', {
        route: encode(route),
        transactions: encode([transaction]),
      }),
    )

    await connectWallet(page, account)
    await lockWallet()

    await page
      .getByRole('button', { name: 'Connect wallet', exact: true })
      .click()

    await expect(
      page.getByRole('textbox', { name: 'Pilot Signer' }),
    ).toHaveValue(getAddress(account))
  })
})
