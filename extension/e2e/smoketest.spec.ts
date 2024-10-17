import { expect, test } from './fixture'
import { getExtensionPage } from './getExtensionPage'

test('connection to example app', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'zodiac' })).toBeInViewport()
})

test('possibility to open the panel', async ({ page, extensionId }) => {
  await page.goto('/')

  await page.getByRole('textbox', { name: 'Extension ID' }).fill(extensionId)
  await page.getByRole('button', { name: 'Open extension' }).click()

  const extension = await getExtensionPage(page)

  await expect(
    extension.getByRole('heading', {
      name: 'Recording Transactions',
    })
  ).toBeInViewport()
})
