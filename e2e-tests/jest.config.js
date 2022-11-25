/** @type {import('jest').Config} */
const config = {
  preset: '@chainsafe/dappeteer',
  globalSetup: './helpers/setup.js',
  globalTeardown: './helpers/teardown.js',
  testEnvironment: './helpers/environment.js',
}

module.exports = config
