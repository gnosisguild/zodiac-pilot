import { Page } from '@playwright/test'
import { expect, test } from './fixture'
import { loadExtension } from './loadExtension'
import { mockWeb3 } from './mockWeb3'

test.describe('Locked account', () => {
  const account = '0x1000000000000000000000000000000000000000'

  const openConfiguration = async (page: Page) => {
    await page.getByRole('link', { name: 'Configure routes' }).click()
    await page.getByRole('button', { name: 'Add Route' }).click()
    await page.getByRole('button', { name: 'Connect with MetaMask' }).click()
    await expect(page.getByText(account)).toBeInViewport()
  }

  test('handles wallet disconnect gracefully', async ({
    page,
    extensionId,
  }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
    })

    const extension = await loadExtension(page, extensionId)

    await openConfiguration(extension)
    await lockWallet()

    await expect(
      extension.getByRole('alert', { name: 'Account disconnected' })
    ).toBeInViewport()
  })

  test('it is possible to reconnect an account', async ({
    page,
    extensionId,
  }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
    })

    const extension = await loadExtension(page, extensionId)

    await openConfiguration(extension)
    await lockWallet()

    await extension.getByRole('button', { name: 'Reconnect' }).click()

    await expect(extension.getByText(account)).toBeInViewport()
  })

  test('it is possible to disconnect a locked account', async ({
    page,
    extensionId,
  }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
    })

    const extension = await loadExtension(page, extensionId)

    await openConfiguration(extension)
    await lockWallet()

    await extension.getByRole('button', { name: 'Disconnect' }).click()

    await expect(
      extension.getByRole('button', { name: 'Connect with MetaMask' })
    ).toBeInViewport()
  })
})
