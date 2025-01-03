import type { Page } from '@playwright/test'
import { getExtensionPage } from './getExtensionPage'

export const loadExtension = async (page: Page) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Open extension' }).click()

  return getExtensionPage(page)
}
