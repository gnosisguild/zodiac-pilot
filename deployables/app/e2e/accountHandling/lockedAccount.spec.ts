import test, { expect } from '@playwright/test'
import { Chain } from '@zodiac/chains'
import { encode } from '@zodiac/schema'
import {
  createMockEndWaypoint,
  createMockEoaAccount,
  createMockExecutionRoute,
  createMockOwnsConnection,
  createMockSafeAccount,
  createMockStartingWaypoint,
  createMockTransaction,
  createMockWaypoints,
  randomAddress,
} from '@zodiac/test-utils'
import { mockWeb3 } from '@zodiac/test-utils/e2e'
import { prefixAddress, unprefixAddress } from 'ser-kit'
import { connectWallet } from '../connectWallet'

test.describe('Locked account', () => {
  const account = '0x1000000000000000000000000000000000000000'

  const initiator = prefixAddress(
    undefined,
    '0xf06a3a90f9a248630bd15f9debc7a6a20e54677d',
  )

  const route = createMockExecutionRoute({
    initiator,
    avatar: prefixAddress(
      Chain.GNO,
      '0xb1578ecfa1da7405821095aa3612158926e6a72a',
    ),
    waypoints: createMockWaypoints({
      start: createMockStartingWaypoint(
        createMockEoaAccount({ address: unprefixAddress(initiator) }),
      ),
      end: createMockEndWaypoint({
        account: createMockSafeAccount({
          chainId: Chain.GNO,
          address: '0xb1578ecfa1da7405821095aa3612158926e6a72a',
        }),
        connection: createMockOwnsConnection(initiator),
      }),
    }),
  })
  const transaction = createMockTransaction({ to: randomAddress() })

  test('handles wallet disconnect gracefully', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page)

    await page.goto(`/submit/${encode(route)}/${encode([transaction])}`)

    await connectWallet(page)
    await lockWallet()

    await expect(
      page.getByRole('alert', { name: 'Wallet disconnected' }),
    ).toBeInViewport()
  })

  test('it is possible to reconnect an account', async ({ page }) => {
    const { lockWallet } = await mockWeb3(page, {
      accounts: [account],
    })

    await page.goto('/new-route')

    await connectWallet(page, account)
    await lockWallet()

    await page
      .getByRole('button', { name: 'Connect wallet', exact: true })
      .click()

    await expect(
      page.getByRole('textbox', { name: 'Pilot Account' }),
    ).toHaveValue(account)
  })
})
