import { expect, Page } from '@playwright/test'
import { defaultMockAccount } from '@zodiac/test-utils/e2e'

export const connectWallet = async (
  page: Page,
  account: `0x${string}` = defaultMockAccount,
) => {
  await page.getByRole('button', { name: 'Connect wallet' }).click()
  await page.getByRole('button', { name: 'MetaMask' }).click()
  await expect(
    page.getByRole('textbox', { name: 'Pilot Account' }),
  ).toHaveValue(account)
}
