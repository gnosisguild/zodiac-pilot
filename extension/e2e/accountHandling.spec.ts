import { Page } from '@playwright/test'
import { expect, test } from './fixture'
import { loadExtension } from './loadExtension'
import { defaultMockAccount, mockWeb3 } from './mockWeb3'

const openConfiguration = async (
  page: Page,
  account: `0x${string}` = defaultMockAccount
) => {
  await page.getByRole('link', { name: 'Configure routes' }).click()
  await page.getByRole('button', { name: 'Add Route' }).click()
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

test.describe('Account unavailable', () => {
  test('handles unavailable accounts gracefully', async ({ page }) => {
    const { loadAccounts } = await mockWeb3(page, {
      accounts: ['0x1000000000000000000000000000000000000000'],
    })

    const extension = await loadExtension(page)

    await openConfiguration(
      extension,
      '0x1000000000000000000000000000000000000000'
    )
    await loadAccounts(['0x2000000000000000000000000000000000000000'])

    await expect(
      extension.getByRole('alert', {
        name: `Account is not connected`,
      })
    ).toHaveAccessibleDescription(
      'Switch your wallet to this account in order to use Pilot.'
    )
  })
})

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
