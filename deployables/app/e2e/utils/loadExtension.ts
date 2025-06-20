import type { Page } from '@playwright/test'
import { expect } from './fixture'
import { getExtensionPage } from './getExtensionPage'

export const loadExtension = async (page: Page) => {
  await page.getByRole('button', { name: 'Open Pilot' }).click()

  const extension = await getExtensionPage(page)

  await extension.waitForLoadState('domcontentloaded')

  await expect(page.getByText('Connected', { exact: true })).toBeInViewport()

  return extension
}
