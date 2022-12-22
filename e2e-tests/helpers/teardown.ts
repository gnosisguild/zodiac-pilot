import os from 'os'
import path from 'path'
import { Browser } from 'puppeteer'
import rimraf from 'rimraf'

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup')

export default async function teardown(config) {
  // don't tear down in watch mode
  if (config.watch || config.watchAll) return

  if (!process.env.CI || process.env.CI === 'false') {
    await new Promise((res) => setTimeout(res, 1000)) // wait for the browser to close to let time for a screenshot to be taken
  }

  // close the browser instance
  await (global as any).browser.close()

  // clean-up the wsEndpoint file
  rimraf.sync(DIR)
}
