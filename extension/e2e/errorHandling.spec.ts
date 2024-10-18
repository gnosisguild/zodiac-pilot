import { mock } from '@depay/web3-mock'
import { test } from './fixture'
import { loadExtension } from './loadExtension'

test('handles wallet disconnect gracefully', async ({ page, extensionId }) => {
  mock('ethereum')

  const extension = await loadExtension(page, extensionId)

  extension.getByRole('link', { name: 'Configure routes' }).click()

  await page.getByRole('button', { name: 'Disconnect Wallet' }).click()
})
