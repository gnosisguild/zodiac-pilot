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
  await page.getByRole('button', { name: 'Connect with MetaMask' }).click()
  await expect(page.getByText(account)).toBeInViewport()
}

test.describe('Wrong chain selected', () => {
  test('it is possible to switch to the correct chain', async ({ page }) => {
    const { switchChain } = await mockWeb3(page)

    const extension = await loadExtension(page)

    await openConfiguration(extension)
    await switchChain(10)

    await expect(
      extension.getByRole('alert', { name: 'Chain mismatch' })
    ).toBeInViewport()
  })

  test('it is possible to switch back to the connected chain', async ({
    page,
  }) => {
    const { switchChain } = await mockWeb3(page)

    const extension = await loadExtension(page)

    await openConfiguration(extension)
    await switchChain(10)

    await expect(
      extension.getByRole('button', { name: 'Switch wallet to Ethereum' })
    ).toBeInViewport()
  })
})
