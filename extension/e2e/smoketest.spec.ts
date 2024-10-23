import { expect, loadExtension, test } from '@/e2e-utils'

test('connection to example app', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'zodiac' })).toBeInViewport()
})

test('possibility to open the panel', async ({ page }) => {
  const extension = await loadExtension(page)

  await expect(
    extension.getByRole('heading', {
      name: 'Recording Transactions',
    })
  ).toBeInViewport()
})
