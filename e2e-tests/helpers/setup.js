const { writeFile } = require('fs').promises
const os = require('os')
const path = require('path')

const { setupMetamask } = require('@chainsafe/dappeteer')

const {
  default: metamaskDownloader,
} = require('@chainsafe/dappeteer/dist/setup/metamaskDownloader')
const mkdirp = require('mkdirp')
const puppeteer = require('puppeteer')

const config = require('../dappteer.config')

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup')

const pilotExtensionPath = path.resolve(__dirname, '../../extension/public')

// export const EXTENSION_ID = createHash('sha256')
//   .update(pilotExtensionPath)
//   .digest('hex') // TODO to unicode (https://stackoverflow.com/a/61448730)
//                  // should be: konilcdngphioajoceoofjdcoppankde

module.exports = async function () {
  const metamaskPath = await metamaskDownloader(
    config.dappeteer.metamaskVersion,
    config.dappeteer.metamaskPath
  )
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${metamaskPath},${pilotExtensionPath}`,
      `--load-extension=${metamaskPath},${pilotExtensionPath}`,
    ],
  })

  try {
    await setupMetamask(browser, config.metamask)
    global.browser = browser
  } catch (error) {
    console.log(error)
    throw error
  }

  mkdirp.sync(DIR)
  await writeFile(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
