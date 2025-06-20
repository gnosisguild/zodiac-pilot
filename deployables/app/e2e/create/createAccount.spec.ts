import { href } from 'react-router'
import { expect, loadExtension, signIn, test } from '../utils'

test.describe('Create new account', () => {
  test.describe.configure({ mode: 'serial' })

  test.describe('Logged out', () => {
    test('it is possible to create a new route', async ({ page }) => {
      await page.goto(href('/create/:prefixedAddress?'))

      const extension = await loadExtension(page)

      await page.getByRole('textbox', { name: 'Label' }).fill('New route')

      await page.getByRole('combobox', { name: 'Chain' }).click()
      await page.getByRole('option', { name: 'Gnosis' }).click()

      await page
        .getByRole('textbox', { name: 'Address' })
        .fill('0xB1578ecfA1da7405821095Aa3612158926e6a72a')

      await page.getByRole('button', { name: 'Create' }).click()

      await expect(extension.getByText('New route')).toBeInViewport()
    })
  })

  test.describe('Logged in', () => {
    test.describe('With open extension', () => {
      test('it is possible to create a new route', async ({ page }) => {
        await page.goto(href('/create/:prefixedAddress?'))

        await signIn(page)

        const extension = await loadExtension(page)

        await page.getByRole('textbox', { name: 'Label' }).fill('New route')

        await page.getByRole('combobox', { name: 'Chain' }).click()
        await page.getByRole('option', { name: 'Gnosis' }).click()

        await page
          .getByRole('textbox', { name: 'Address' })
          .fill('0xB1578ecfA1da7405821095Aa3612158926e6a72a')

        await page.getByRole('button', { name: 'Create' }).click()

        await expect(extension.getByText('New route')).toBeInViewport()
      })
    })

    test.describe('With closed extension', () => {
      test('it is possible to create a new route', async ({ page }) => {
        await page.goto(href('/create/:prefixedAddress?'))

        await signIn(page)

        await page.getByRole('textbox', { name: 'Label' }).fill('New route')

        await page.getByRole('combobox', { name: 'Chain' }).click()
        await page.getByRole('option', { name: 'Gnosis' }).click()

        await page
          .getByRole('textbox', { name: 'Address' })
          .fill('0xB1578ecfA1da7405821095Aa3612158926e6a72a')

        await page.getByRole('button', { name: 'Create' }).click()

        await expect(
          page.getByRole('cell', { name: 'New route' }),
        ).toBeInViewport()
      })
    })
  })
})
