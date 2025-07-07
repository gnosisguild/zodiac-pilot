import { href } from 'react-router'
import { expect, loadExtension, test } from './utils'

test('connection to companion app', async ({ page }) => {
  await page.goto(href('/offline/accounts/create'))

  await loadExtension(page)

  await expect(
    page.getByRole('heading', { name: 'New local Safe Account' }),
  ).toBeInViewport()
})
