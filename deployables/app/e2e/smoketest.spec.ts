import test, { expect } from '@playwright/test'

test('connection to companion app', async ({ page }) => {
  await page.goto('/create')

  await expect(
    page.getByRole('heading', { name: 'New Account' }),
  ).toBeInViewport()
})
