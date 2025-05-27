import { getE2ECredentials } from '@zodiac/env'
import { expect, test } from '../utils'

test('login', async ({ page }) => {
  await page.goto('/')

  const { user, password } = getE2ECredentials()

  await page.getByRole('link', { name: 'Sign in' }).click()

  await page.getByRole('textbox', { name: 'Email' }).fill(user)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  await expect(page.getByRole('link', { name: 'Test User' })).toBeInViewport()
})
