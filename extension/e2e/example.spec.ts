import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'zodiac' })).toBeInViewport()
})
