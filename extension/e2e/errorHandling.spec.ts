import { mock } from '@depay/web3-mock'
import { test } from './fixture'

test('handles wallet disconnect gracefully', async ({ page }) => {
  mock('ethereum')

  await page.getByRole('button', { name: 'Disconnect Wallet' }).click()
})
