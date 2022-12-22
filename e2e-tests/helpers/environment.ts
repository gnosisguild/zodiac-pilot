import puppeteer, { Browser, Page } from 'puppeteer'

import { promises } from 'fs'
import os from 'os'
import path from 'path'
import NodeEnvironment from 'jest-environment-node'
import { Dappeteer, getMetamaskWindow } from '@chainsafe/dappeteer'
import { screenshot } from './screenshot'

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup')

interface GlobalAdditions {
  browser: Browser
  metamask: Dappeteer
}

class DappeteerEnvironment extends NodeEnvironment {
  global: NodeEnvironment['global'] & GlobalAdditions

  async setup() {
    await super.setup()
    // get the wsEndpoint
    const wsEndpoint = await promises.readFile(
      path.join(DIR, 'wsEndpoint'),
      'utf8'
    )
    if (!wsEndpoint) throw new Error('wsEndpoint not found')

    // connect to puppeteer
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
    })

    this.global.browser = browser
    this.global.metamask = await getMetamaskWindow(browser)
  }

  // Take a screenshot of the page on failing tests
  async handleTestEvent(event, state) {
    if (event.name === 'test_fn_failure') {
      console.log('Taking screenshot on failing test...')

      const page = await this.getActivePilotPage()
      if (page) {
        await screenshot(page, state.currentlyRunningTest.name)
        await page.close()
      }
      await screenshot(
        this.global.metamask.page,
        `${state.currentlyRunningTest.name}-metamask`
      )
    }
  }

  async getActivePilotPage(): Promise<Page | undefined> {
    const pages = await this.global.browser.pages()
    const pilotPages = pages.filter((page) =>
      page.url().startsWith('https://pilot.gnosisguild.org')
    )
    let lastModifiedPilotPage: Page | undefined = undefined
    let lastModifiedDate = 0
    let l = pilotPages[0]
    for (const pilotPage of pilotPages) {
      const lastModified = new Date(
        await pilotPage.evaluate(() => document.lastModified)
      ).getTime()
      if (lastModified > lastModifiedDate) {
        lastModifiedDate = lastModified
        lastModifiedPilotPage = pilotPage
      }
    }
    if (!lastModifiedPilotPage) {
      console.warn('No active Pilot extension page found')
    }
    return lastModifiedPilotPage
  }
}

module.exports = DappeteerEnvironment
