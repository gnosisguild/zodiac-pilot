import { account } from './account'

export const launchFresh = async () => {
  await removeLocalStorage(['connections', 'selectedConnection'])

  const page = await browser.newPage()
  await page.goto('https://pilot.gnosisguild.org')
  return page
}

export const launch = async (
  selectedConnection: 'gnosis' | 'jan' | 'auryn' = 'gnosis'
) => {
  await setLocalStorage({
    connections: JSON.stringify(TEST_CONNECTIONS),
    selectedConnection: JSON.stringify(selectedConnection),
  })

  const page = await browser.newPage()
  await page.goto('https://pilot.gnosisguild.org')
  return page
}

const setLocalStorage = async (values: Record<string, string>) => {
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', (r) => {
    r.respond({
      status: 200,
      contentType: 'text/plain',
      body: 'tweak me.',
    })
  })
  await page.goto('https://pilot.gnosisguild.org')
  await page.evaluate((values) => {
    for (const key in values) {
      localStorage.setItem(key, values[key])
    }
  }, values)
  await page.close()
}

const removeLocalStorage = async (values: string[]) => {
  const page = await browser.newPage()
  await page.setRequestInterception(true)
  page.on('request', (r) => {
    r.respond({
      status: 200,
      contentType: 'text/plain',
      body: 'tweak me.',
    })
  })
  await page.goto('https://pilot.gnosisguild.org')
  await page.evaluate((values) => {
    for (const value in values) {
      localStorage.removeItem(value)
    }
  }, values)
  await page.close()
}

const TEST_CONNECTIONS = [
  {
    id: 'gnosis',
    label: 'Gnosis DAO on GC',
    chainId: 100,
    moduleAddress: '0x10785356e66b93432e9e8d6f9e532fa55e4fc058',
    avatarAddress: '0x458cd345b4c05e8df39d0a07220feb4ec19f5e6f',
    providerType: 0,
    roleId: '1',
    pilotAddress: '0xe4387d4e45f65240daaf5e046d5ae592566a5076',
    moduleType: 'roles',
  },
  {
    id: 'jan',
    label: 'Jan Test DAO',
    chainId: 100,
    avatarAddress: '0x8bbd876d534e6e00e61414f00576627e4466bbde',
    pilotAddress: '0xb07520a4494793461cf8762246b7d8695548c22b', // account is a Role member
    providerType: 1,
    roleId: '1',
    moduleAddress: '0x946891e8fd9e1ad0f18dbd1065c2864d1d3f236d',
  },
  {
    id: 'auryn',
    label: 'Auryn Test DAO',
    chainId: 5,
    avatarAddress: '0x018a3e7717fa5ab963e99f87b66985569976005a',
    pilotAddress: '0x12f5853fc7763fca5a22146b6d16bbc63b879d87', // account is not in MetaMask
    providerType: 1,
    roleId: '1',
    moduleAddress: '',
  },
]
