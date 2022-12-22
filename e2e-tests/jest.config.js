/** @type {import('jest').Config} */
const config = {
  preset: '@chainsafe/dappeteer',
  globalSetup: './helpers/setup.ts',
  globalTeardown: './helpers/teardown.ts',
  testEnvironment: './helpers/environment.ts',
}

module.exports = config
