import { encode } from '@zodiac/schema'
import { href } from 'react-router'
import { expect, loadExtension, test } from '../utils'
import { route } from './fixture'

test.describe('Edit route', () => {
  test('it is possible to save a route', async ({ page }) => {
    await page.goto(
      href('/offline/accounts/:accountId/:data', {
        accountId: route.id,
        data: encode(route),
      }),
    )

    const extension = await loadExtension(page)

    await page.getByRole('textbox', { name: 'Label' }).fill('New route')
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(extension.getByText('New route')).toBeInViewport()
  })

  test('the new route shows up in the list afterwards', async ({ page }) => {
    await page.goto(
      href('/offline/accounts/:accountId/:data', {
        accountId: route.id,
        data: encode(route),
      }),
    )

    await loadExtension(page)

    await page.getByRole('textbox', { name: 'Label' }).fill('New route')
    await page.getByRole('button', { name: 'Save', exact: true }).click()

    await expect(page.getByRole('cell', { name: 'New route' })).toBeInViewport()
  })
})
