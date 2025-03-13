import { encode } from '@zodiac/schema'
import { expect, loadExtension, test } from '../utils'
import { route } from './fixture'

test.describe('Edit route', () => {
  test('it is possible to save a route', async ({ page }) => {
    await page.goto(`/edit/${route.id}/${encode(route)}`)

    const extension = await loadExtension(page)

    await page.getByRole('textbox', { name: 'Label' }).fill('New route')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(extension.getByText('New route')).toBeInViewport()
  })

  test('the new route shows up in the list afterwards', async ({ page }) => {
    await page.goto(`/edit/${route.id}/${encode(route)}`)

    await loadExtension(page)

    await page.getByRole('textbox', { name: 'Label' }).fill('New route')
    await page.getByRole('button', { name: 'Save' }).click()

    expect(page.getByRole('cell', { name: 'New route' })).toBeInViewport()
  })
})
