import { expect, type Page } from '@playwright/test'
import type { Hex } from '@zodiac/schema'
import { defaultMockAccount } from '@zodiac/test-utils/e2e'
import { getAddress } from 'viem'

export const connectWallet = async (
  page: Page,
  account: Hex = defaultMockAccount,
) => {
  await page.getByRole('button', { name: 'Connect wallet' }).click()
  await page.getByRole('button', { name: 'Browser Wallet' }).click()
  await expect(page.getByRole('textbox', { name: 'Pilot Signer' })).toHaveValue(
    getAddress(account),
  )

  await expect(
    page.getByRole('alert', { name: 'Wallet disconnected' }),
  ).not.toBeInViewport()
}
