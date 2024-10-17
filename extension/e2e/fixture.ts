/* eslint-disable no-empty-pattern */
import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'path'

export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, '../public')

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
      ignoreDefaultArgs: [
        '--disable-component-extensions-with-background-pages',
      ],
    })

    await use(context)
    await context.close()
  },

  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers()
    if (!background) background = await context.waitForEvent('serviceworker')

    const extensionId = background.url().split('/')[2]

    await use(extensionId)
  },
})

export const expect = test.expect