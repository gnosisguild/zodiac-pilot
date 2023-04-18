/** @type {import('@chainsafe/dappeteer').DappeteerJestConfig} */

const config = {
  dappeteer: {
    metamaskVersion: 'v10.28.3',
  },
  metamask: {
    seed: process.env.SEED_PHRASE,
    password: 'password1234',
  },
}

module.exports = config
