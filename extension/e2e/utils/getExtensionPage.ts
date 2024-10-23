import { Page } from '@playwright/test'
import { waitFor } from './waitFor'

export const getExtensionPage = (page: Page) =>
  waitFor(() => {
    const extension = page
      .context()
      .pages()
      .find((page) => page.url().startsWith('chrome-extension'))

    if (extension == null) {
      throw new Error('Extension not found')
    }

    return extension
  })
