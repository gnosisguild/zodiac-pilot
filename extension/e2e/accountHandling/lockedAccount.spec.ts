import {
  defaultMockAccount,
  expect,
  loadExtension,
  mockWeb3,
  test,
} from '@/e2e-utils'
import { Page } from '@playwright/test'

const openConfiguration = async (
  page: Page,
  account: `0x${string}` = defaultMockAccount
) => {
  await page.getByRole('link', { name: 'Configure routes' }).click()
  await page.getByRole('button', { name: 'Add Route' }).click()

  // MONDAY PHIL: This button is not being enabled
  await page.getByRole('button', { name: 'Connect with MetaMask' }).click()
  await expect(page.getByText(account)).toBeInViewport()
}

test.describe('Locked account', () => {
  const account = '0x1000000000000000000000000000000000000000'

  test('handles wallet disconnect gracefully', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page)

    const extension = await loadExtension(page)

    await openConfiguration(extension)
    await lockWallet()

    await expect(
      extension.getByRole('alert', { name: 'Wallet disconnected' })
    ).toBeInViewport()
  })

  test('it is possible to reconnect an account', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
    })

    const extension = await loadExtension(page)

    await openConfiguration(extension, account)
    await lockWallet()

    await extension
      .getByRole('button', { name: 'Connect', exact: true })
      .click()

    await expect(extension.getByText(account)).toBeInViewport()
  })

  test('it is possible to disconnect a locked account', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page)

    const extension = await loadExtension(page)

    await openConfiguration(extension)
    await lockWallet()

    await extension.getByRole('button', { name: 'Disconnect' }).click()

    await expect(
      extension.getByRole('button', { name: 'Connect with MetaMask' })
    ).toBeInViewport()
  })
})
