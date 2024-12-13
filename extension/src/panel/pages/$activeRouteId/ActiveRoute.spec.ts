import { EOA_ZERO_ADDRESS } from '@/chains'
import { getRoute } from '@/execution-routes'
import { useDisconnectWalletConnectIfNeeded } from '@/providers'
import { mockRoute, randomAddress, render } from '@/test-utils'
import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { action, ActiveRoute, loader } from './ActiveRoute'

vi.mock('@/providers', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/providers')>()

  return {
    ...module,

    useDisconnectWalletConnectIfNeeded: vi.fn(
      module.useDisconnectWalletConnectIfNeeded,
    ),
  }
})

const mockUseDisconnectWalletConnectIfNeeded = vi.mocked(
  useDisconnectWalletConnectIfNeeded,
)

describe('Active execution route', () => {
  it('resets the pilot address when wallet connect disconnects', async () => {
    await mockRoute({ id: 'route-id', initiator: `eoa:${randomAddress()}` })

    await render('/route-id', [
      { path: '/:activeRouteId', Component: ActiveRoute, loader, action },
    ])

    // @ts-expect-error bit hacky way
    const [, { onDisconnect }] =
      mockUseDisconnectWalletConnectIfNeeded.mock.lastCall || []

    onDisconnect()

    await waitFor(async () => {
      await expect(getRoute('route-id')).resolves.toHaveProperty(
        'initiator',
        EOA_ZERO_ADDRESS,
      )
    })
  })
})
