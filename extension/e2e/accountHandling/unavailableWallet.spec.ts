import {
  defaultMockAccount,
  expect,
  loadExtension,
  mockWeb3,
  test,
} from '@/e2e-utils'
import type { Page } from '@playwright/test'

const openConfiguration = async (
  page: Page,
  account: `0x${string}` = defaultMockAccount,
) => {
  await page.getByRole('link', { name: 'Configure routes' }).click()
  await page.getByRole('button', { name: 'Add Route' }).click()
  await page.getByRole('button', { name: 'Connect with MetaMask' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Pilot Account' }),
  ).toHaveValue(account)
}

test.describe('Account unavailable', () => {
  test('handles unavailable accounts gracefully', async ({ page }) => {
    const { loadAccounts } = await mockWeb3(page, {
      accounts: ['0x1000000000000000000000000000000000000000'],
    })

    const extension = await loadExtension(page)

    await openConfiguration(
      extension,
      '0x1000000000000000000000000000000000000000',
    )
    await loadAccounts(['0x2000000000000000000000000000000000000000'])

    await expect(
      extension.getByRole('alert', {
        name: `Account is not connected`,
      }),
    ).toHaveAccessibleDescription(
      'Switch your wallet to this account in order to use Pilot.',
    )
  })
})
