import { expect, test } from '@playwright/test'

test('connection to example app', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'zodiac' })).toBeInViewport()
})
