import test, { expect } from '@playwright/test'
import { Chain } from '@zodiac/chains'
import { encode } from '@zodiac/schema'
import { mockWeb3 } from '@zodiac/test-utils/e2e'
import { href } from 'react-router'
import { connectWallet } from '../connectWallet'
import { account, route, transaction } from './fixture'

test.describe('Wrong chain selected', () => {
  test('it is possible to switch to the correct chain', async ({ page }) => {
    const { switchChain } = await mockWeb3(page, {
      accounts: [account],
      chain: 'gnosis',
    })

    await page.goto(
      href('/offline/submit/:route/:transactions', {
        route: encode(route),
        transactions: encode([transaction]),
      }),
    )

    await connectWallet(page, account)
    await switchChain(Chain.OETH)

    await expect(
      page.getByRole('alert', { name: 'Chain mismatch' }),
    ).toBeInViewport()
  })

  test('it is possible to switch back to the connected chain', async ({
    page,
  }) => {
    const { switchChain } = await mockWeb3(page, {
      accounts: [account],
      chain: 'gnosis',
    })

    await page.goto(
      href('/offline/submit/:route/:transactions', {
        route: encode(route),
        transactions: encode([transaction]),
      }),
    )

    await connectWallet(page, account)
    await switchChain(Chain.OETH)

    await expect(
      page.getByRole('button', { name: 'Switch wallet to Gnosis' }),
    ).toBeInViewport()
  })
})
