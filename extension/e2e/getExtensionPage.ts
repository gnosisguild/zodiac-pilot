import { Page } from '@playwright/test'

export const getExtensionPage = (page: Page) => {
  const extension = page
    .context()
    .pages()
    .find((page) => page.url().startsWith('chrome-extension'))

  if (extension == null) {
    throw new Error('Extension not found')
  }

  return extension
}
