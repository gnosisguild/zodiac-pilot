import { mock } from '@depay/web3-mock'
import { expect, test } from './fixture'
import { loadExtension } from './loadExtension'
import { mockWeb3 } from './mockWeb3'

test('handles wallet disconnect gracefully', async ({ page, extensionId }) => {
  const { trigger } = mockWeb3(page, () =>
    mock({
      blockchain: 'ethereum',
      accounts: { return: ['0x1000000000000000000000000000000000000000'] },
    })
  )

  const extension = await loadExtension(page, extensionId)

  await extension.getByRole('link', { name: 'Configure routes' }).click()
  await extension.getByRole('button', { name: 'Add Route' }).click()
  await extension.getByRole('button', { name: 'Connect with MetaMask' }).click()
  await expect(
    extension.getByText('0x1000000000000000000000000000000000000000')
  ).toBeInViewport()

  await trigger('disconnect')

  await expect(
    extension.getByRole('alert', { name: 'Account disconnected' })
  ).toBeInViewport()
})
