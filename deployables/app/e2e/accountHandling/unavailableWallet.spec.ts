import test, { expect } from '@playwright/test'
import { mockWeb3 } from '@zodiac/test-utils/e2e'
import { connectWallet } from '../connectWallet'

test.describe('Account unavailable', () => {
  test('handles unavailable accounts gracefully', async ({ page }) => {
    const { loadAccounts } = await mockWeb3(page, {
      accounts: ['0x1000000000000000000000000000000000000000'],
    })

    await page.goto('/new-route')

    await connectWallet(page, '0x1000000000000000000000000000000000000000')
    await loadAccounts(['0x2000000000000000000000000000000000000000'])

    await expect(
      page.getByRole('alert', {
        name: `Wallet is set to a different account`,
      }),
    ).toHaveAccessibleDescription(
      'Switch your wallet to this account in order to use Pilot.',
    )
  })
})
