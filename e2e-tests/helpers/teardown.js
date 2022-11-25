const os = require('os')
const path = require('path')
const rimraf = require('rimraf')

const DIR = path.join(os.tmpdir(), 'jest_dappeteer_global_setup')

module.exports = async function () {
  if (!process.env.CI || process.env.CI === 'false') {
    await new Promise((res) => setTimeout(res, 1000)) // wait for the browser to close to let time screenshot to be taken
  }

  // close the browser instance
  await global.browser.close()

  // clean-up the wsEndpoint file
  rimraf.sync(DIR)
}
