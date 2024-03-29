import { promises } from 'fs'
import os from 'os'
import path from 'path'

import { setupMetamask } from '@chainsafe/dappeteer'

import metamaskDownloader from '@chainsafe/dappeteer/dist/setup/metamaskDownloader'
import mkdirp from 'mkdirp'
import puppeteer from 'puppeteer'
import * as dotenv from 'dotenv'
import config from '../dappeteer.config'

dotenv.config()

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup')

const pilotExtensionPath = path.resolve(__dirname, '../../extension/public')

export const metamaskPassword = 'password1234'

// export const EXTENSION_ID = createHash('sha256')
//   .update(pilotExtensionPath)
//   .digest('hex') // TODO to unicode (https://stackoverflow.com/a/61448730)
//                  // should be: konilcdngphioajoceoofjdcoppankde

let firstRun = true
export default async function setup() {
  if (!firstRun) return // prevent relaunch in watch mode
  firstRun = false

  const metamaskPath = await metamaskDownloader(
    config.dappeteer.metamaskVersion
  )
  const browser = await puppeteer.launch({
    headless: false, // Dappeteer only works in headful mode
    executablePath: process.env.PUPPETEER_EXEC_PATH, // required for running in CI (env var is set in mujo-code/puppeteer-headful's container)
    args: [
      '--no-sandbox',
      `--disable-extensions-except=${metamaskPath},${pilotExtensionPath}`,
      `--load-extension=${metamaskPath},${pilotExtensionPath}`,
    ],
  })

  try {
    await setupMetamask(browser, config.metamask)
    ;(global as any).browser = browser
  } catch (error) {
    console.log(error)
    throw error
  }

  mkdirp.sync(DIR)
  await promises.writeFile(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
