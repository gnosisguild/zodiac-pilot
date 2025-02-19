import { expect, type Page } from '@playwright/test'
import { defaultMockAccount } from '@zodiac/test-utils/e2e'

export const connectWallet = async (
  page: Page,
  account: `0x${string}` = defaultMockAccount,
) => {
  await page.getByRole('button', { name: 'Connect wallet' }).click()
  await page.getByRole('button', { name: 'Browser Wallet' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Pilot Account' }),
  ).toHaveValue(account)

  await expect(
    page.getByRole('alert', { name: 'Wallet disconnected' }),
  ).not.toBeInViewport()
}
