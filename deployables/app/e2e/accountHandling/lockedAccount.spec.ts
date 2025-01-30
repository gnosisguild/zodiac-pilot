import test, { expect } from '@playwright/test'
import { mockWeb3 } from '@zodiac/test-utils/e2e'
import { connectWallet } from '../connectWallet'

test.describe('Locked account', () => {
  const account = '0x1000000000000000000000000000000000000000'

  test('handles wallet disconnect gracefully', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page)

    await page.goto('/new-route')

    await connectWallet(page)
    await lockWallet()

    await expect(
      page.getByRole('alert', { name: 'Wallet disconnected' }),
    ).toBeInViewport()
  })

  test('it is possible to reconnect an account', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
    })

    await page.goto('/new-route')

    await connectWallet(page, account)
    await lockWallet()

    await page
      .getByRole('button', { name: 'Connect wallet', exact: true })
      .click()

    await expect(
      page.getByRole('textbox', { name: 'Pilot Account' }),
    ).toHaveValue(account)
  })
})
