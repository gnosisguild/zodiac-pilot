/** @type {import('@chainsafe/dappeteer').DappeteerJestConfig} */

const config = {
  dappeteer: {
    metamaskVersion: 'v10.18.4',
  },
  metamask: {
    seed: process.env.SEED_PHRASE,
    password: 'password1234',
  },
}

module.exports = config
