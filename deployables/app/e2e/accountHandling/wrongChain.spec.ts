import test, { expect } from '@playwright/test'
import { mockWeb3 } from '@zodiac/test-utils/e2e'
import { connectWallet } from '../connectWallet'

test.describe('Wrong chain selected', () => {
  test('it is possible to switch to the correct chain', async ({ page }) => {
    await page.goto('/new-route')

    const { switchChain } = await mockWeb3(page)

    await connectWallet(page)
    await switchChain(10)

    await expect(
      page.getByRole('alert', { name: 'Chain mismatch' }),
    ).toBeInViewport()
  })

  test('it is possible to switch back to the connected chain', async ({
    page,
  }) => {
    const { switchChain } = await mockWeb3(page)

    await connectWallet(page)
    await switchChain(10)

    await expect(
      page.getByRole('button', { name: 'Switch wallet to Ethereum' }),
    ).toBeInViewport()
  })
})
