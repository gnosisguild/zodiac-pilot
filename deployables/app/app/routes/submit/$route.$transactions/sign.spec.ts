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
    // @ts-expect-error We really only want to use this subset
    mockUseAccount.mockReturnValue({
      address: unprefixAddress(initiator),
      chainId,
    })

    // @ts-expect-error We just need this to be there
    mockUseConnectorClient.mockReturnValue({ data: {} })

    mockSimulateTransactionBundle.mockResolvedValue({
      approvalTransactions: [],
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

    describe('Invalid route', () => {
      it('disables the submit button when no routes can be found', async () => {
        const currentRoute = createMockSerRoute({ initiator })
        const transaction = createMockTransaction()

        mockQueryRoutes.mockResolvedValue([])

        await render(
          href('/submit/:route/:transactions', {
            route: encode(currentRoute),
            transactions: encode([transaction]),
          }),
        )

        expect(screen.getByRole('button', { name: 'Sign' })).toBeDisabled()
      })

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
          screen.getByRole('alert', { name: 'Invalid route' }),
        ).toHaveAccessibleDescription(
          'You cannot sign this transaction as we could not find any route form the signer wallet to the account.',
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
            name: 'Routes backend unavailable',
          }),
        ).toHaveAccessibleDescription(
          'We could not verify the currently selected route. Please proceed with caution.',
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
      mockQueryRoutes.mockResolvedValue([route])
    })

    it('disables the sign button if permission checks fail', async () => {
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

      expect(screen.getByRole('button', { name: 'Sign' })).toBeDisabled()
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
  })

  describe('Approvals', () => {
    beforeEach(() => {
      mockQueryRoutes.mockResolvedValue([])
      mockCheckPermissions.mockResolvedValue({
        error: undefined,
        success: true,
      })
    })

    it('does not revoke approvals by default', async () => {
      mockSimulateTransactionBundle.mockResolvedValue({
        approvalTransactions: [
          { spender: randomAddress(), tokenAddress: randomAddress() },
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
