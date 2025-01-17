import type { Page } from '@playwright/test'
import { waitFor } from '@zodiac/test-utils/e2e'

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
