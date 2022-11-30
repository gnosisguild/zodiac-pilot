const { readFile, writeFile } = require('fs').promises
const os = require('os')
const path = require('path')
const puppeteer = require('puppeteer')
const { default: NodeEnvironment } = require('jest-environment-node')
const { getMetamaskWindow } = require('@chainsafe/dappeteer')
const mkdirp = require('mkdirp')

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup')

class DappeteerEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup()
    // get the wsEndpoint
    const wsEndpoint = await readFile(path.join(DIR, 'wsEndpoint'), 'utf8')
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

      const dir = path.resolve(__dirname, '../output/screenshots')
      mkdirp.sync(dir)

      const date = new Date()
      const timeFormatted = `${date.getHours()}h${date.getMinutes()}m${date.getSeconds()}s`
      const filename =
        state.currentlyRunningTest.name
          .replaceAll(' ', '-')
          .replaceAll('"', '') +
        '-' +
        timeFormatted

      const page = await this.getActivePage()
      page.screenshot({
        path: `${dir}/${filename}.png`,
        type: 'png',
        fullPage: true,
      })

      await writeFile(`${dir}/${filename}.html`, await page.content())
    }
  }

  async getActivePage() {
    const pages = await this.global.browser.pages()
    for (let i = 0; i < pages.length; i++) {
      const isHidden = await pages[i].evaluate(() => document.hidden)
      if (!isHidden) {
        return pages[i]
      }
    }

    throw new Error('No active page found')
  }
}

module.exports = DappeteerEnvironment
