import { expect, test } from './fixture'

test('connection to example app', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'zodiac' })).toBeInViewport()
})

test('possibility to open the panel', async ({ page, extensionId }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open extension' }).click()

  const pages = page.context().pages()

  console.log({ pages })
})
