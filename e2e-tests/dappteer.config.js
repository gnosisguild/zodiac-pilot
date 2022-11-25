const { RECOMMENDED_METAMASK_VERSION } = require('@chainsafe/dappeteer')

/** @type {import('@chainsafe/dappeteer').DappateerJestConfig} */
const config = {
  dappeteer: {
    metamaskVersion: RECOMMENDED_METAMASK_VERSION,
  },
  metamask: {
    seed: 'already turtle birth enroll since owner keep patch skirt drift any dinner',
    password: 'password1234',
  },
}

module.exports = config
