import { simulateTransactionBundle } from '@/simulation-server'
import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import { Chain } from '@zodiac/chains'
import { encode } from '@zodiac/schema'
import {
  createMockExecutionRoute,
  createMockSerRoute,
  createMockTransaction,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import {
  checkPermissions,
  PermissionViolation,
  planExecution,
  prefixAddress,
  queryRoutes,
  unprefixAddress,
} from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccount, useConnectorClient } from 'wagmi'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    planExecution: vi.fn(),
    queryRoutes: vi.fn(),
    checkPermissions: vi.fn(),
  }
})

const mockQueryRoutes = vi.mocked(queryRoutes)
const mockCheckPermissions = vi.mocked(checkPermissions)

vi.mock('wagmi', async (importOriginal) => {
  const module = await importOriginal<typeof import('wagmi')>()

  return {
    ...module,

    useAccount: vi.fn(module.useAccount),
    useConnectorClient: vi.fn(module.useConnectorClient),
  }
})

const mockUseAccount = vi.mocked(useAccount)
const mockUseConnectorClient = vi.mocked(useConnectorClient)

vi.mock('@/simulation-server', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/simulation-server')>()

  return {
    ...module,

    simulateTransactionBundle: vi.fn(),
  }
})

const mockSimulateTransactionBundle = vi.mocked(simulateTransactionBundle)

describe('Sign', () => {
  const chainId = Chain.ETH
  const initiator = randomPrefixedAddress({ chainId: undefined })

  beforeEach(() => {
    // @ts-expect-error We only needs an empty array
    vi.mocked(planExecution).mockResolvedValue([])

    // @ts-expect-error We really only want to use this subset
    mockUseAccount.mockReturnValue({
      address: unprefixAddress(initiator),
      chainId,
    })

    // @ts-expect-error We just need this to be there
    mockUseConnectorClient.mockReturnValue({ data: {} })

    mockSimulateTransactionBundle.mockResolvedValue({
      error: null,
      approvals: [],
      tokenFlows: { sent: [], received: [], other: [] },
    })
  })

  describe('Route', () => {
    beforeEach(() => {
      mockCheckPermissions.mockResolvedValue({
        success: true,
        error: undefined,
      })
    })

    describe('Unknown route', () => {
      it('shows a warning to the user', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockQueryRoutes.mockResolvedValue([])

        await render(
          href('/submit/:route/:transactions', {
            route: encode(currentRoute),
            transactions: encode([transaction]),
          }),
        )

        expect(
          screen.getByRole('alert', { name: 'Unknown route' }),
        ).toHaveAccessibleDescription(
          'The selected execution route appears invalid. Proceed with caution.',
        )
      })
    })

    describe('Ser unavailability', () => {
      it('shows the page even when ser-kit cannot query routes', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockQueryRoutes.mockRejectedValue('Ser is down')

        await expect(
          render(
            href('/submit/:route/:transactions', {
              route: encode(currentRoute),
              transactions: encode([transaction]),
            }),
          ),
        ).resolves.not.toThrow()
      })

      it('shows a warning when ser is unavailable', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockQueryRoutes.mockRejectedValue('Ser is down')

        await render(
          href('/submit/:route/:transactions', {
            route: encode(currentRoute),
            transactions: encode([transaction]),
          }),
        )

        expect(
          await screen.findByRole('alert', {
            name: 'Route validation unavailable',
          }),
        ).toHaveAccessibleDescription(
          'The selected execution route could not be validated. Proceed with caution.',
        )
      })

      it('enables the "Sign" button when ser is unavailable', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockQueryRoutes.mockRejectedValue('Ser is down')

        await render(
          href('/submit/:route/:transactions', {
            route: encode(currentRoute),
            transactions: encode([transaction]),
          }),
        )

        expect(
          await screen.findByRole('button', { name: 'Sign' }),
        ).toBeEnabled()
      })
    })
  })

  describe('Permissions', () => {
    const route = createMockSerRoute({ initiator })

    beforeEach(() => {
      // @ts-expect-error We only needs an empty array
      vi.mocked(planExecution).mockResolvedValue([])
      mockQueryRoutes.mockResolvedValue([route])
    })

    it('shows the permission error', async () => {
      const transaction = createMockTransaction()

      mockCheckPermissions.mockResolvedValue({
        success: false,
        error: PermissionViolation.AllowanceExceeded,
      })

      await render(
        href('/submit/:route/:transactions', {
          route: encode(route),
          transactions: encode([transaction]),
        }),
      )

      expect(
        screen.getByRole('alert', { name: 'Permission violation' }),
      ).toHaveAccessibleDescription(PermissionViolation.AllowanceExceeded)
    })

    describe('Ser unavailability', () => {
      it('shows the page even when ser-kit cannot check permissions', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockCheckPermissions.mockRejectedValue('Ser is down')

        await expect(
          render(
            href('/submit/:route/:transactions', {
              route: encode(currentRoute),
              transactions: encode([transaction]),
            }),
          ),
        ).resolves.not.toThrow()
      })

      it('shows a warning when ser is unavailable', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockCheckPermissions.mockRejectedValue('Ser is down')

        await render(
          href('/submit/:route/:transactions', {
            route: encode(currentRoute),
            transactions: encode([transaction]),
          }),
        )

        expect(
          await screen.findByRole('alert', {
            name: 'Permissions check unavailable',
          }),
        ).toHaveAccessibleDescription(
          'We could not check the permissions for this route. Proceed with caution.',
        )
      })

      it('enables the "Sign" button when ser is unavailable', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockCheckPermissions.mockRejectedValue('Ser is down')

        await render(
          href('/submit/:route/:transactions', {
            route: encode(currentRoute),
            transactions: encode([transaction]),
          }),
        )

        expect(
          await screen.findByRole('button', { name: 'Sign' }),
        ).toBeEnabled()
      })
    })
  })

  describe('Approvals', () => {
    beforeEach(() => {
      // @ts-expect-error We only needs an empty array
      vi.mocked(planExecution).mockResolvedValue([])

      mockQueryRoutes.mockResolvedValue([])
      mockCheckPermissions.mockResolvedValue({
        error: undefined,
        success: true,
      })
    })

    it('does not revoke approvals by default', async () => {
      mockSimulateTransactionBundle.mockResolvedValue({
        error: null,
        approvals: [
          {
            spender: randomAddress(),
            tokenAddress: randomAddress(),
            symbol: '',
            logoUrl: '',
            decimals: 0,
            approvalAmount: 0n,
          },
        ],
        tokenFlows: { sent: [], received: [], other: [] },
      })

      await render(
        href('/submit/:route/:transactions', {
          route: encode(
            createMockExecutionRoute({
              initiator: prefixAddress(undefined, randomAddress()),
            }),
          ),
          transactions: encode([createMockTransaction()]),
        }),
      )

      expect(
        await screen.findByRole('checkbox', { name: 'Revoke all approvals' }),
      ).not.toBeChecked()
    })
  })
})
