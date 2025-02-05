import test, { expect } from '@playwright/test'

test('connection to example app', async ({ page }) => {
  await page.goto('/new-route')

  await expect(
    page.getByRole('heading', { name: 'Edit route' }),
  ).toBeInViewport()
})
