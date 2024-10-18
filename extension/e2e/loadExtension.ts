import { Page } from '@playwright/test'
import { getExtensionPage } from './getExtensionPage'

export const loadExtension = async (page: Page, extensionId: string) => {
  await page.goto('/')

  await page.getByRole('textbox', { name: 'Extension ID' }).fill(extensionId)
  await page.getByRole('button', { name: 'Open extension' }).click()

  const extension = await getExtensionPage(page)

  return extension
}
