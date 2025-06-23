import type { Page } from '@playwright/test'
import { getE2ECredentials } from '@zodiac/env'
import { expect } from './fixture'

export const signIn = async (page: Page) => {
  const { user, password } = getE2ECredentials()

  await page.getByRole('link', { name: 'Sign in' }).click()

  await page.getByRole('textbox', { name: 'Email' }).fill(user)
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByRole('textbox', { name: 'Password' }).fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  await expect(
    page.getByRole('link', { name: 'Your profile' }),
  ).toBeInViewport()

  await page.waitForLoadState('load')
}
