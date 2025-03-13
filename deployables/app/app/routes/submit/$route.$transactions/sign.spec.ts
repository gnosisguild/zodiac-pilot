import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain } from '@zodiac/chains'
import { encode } from '@zodiac/schema'
import {
  createMockSerRoute,
  createMockTransaction,
  expectRouteToBe,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import {
  checkPermissions,
  PermissionViolation,
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
  })

  describe('Route', () => {
    beforeEach(() => {
      mockCheckPermissions.mockResolvedValue({
        success: true,
        error: undefined,
      })
    })

    it('is possible to update the route', async () => {
      const currentRoute = createMockSerRoute()
      const newRoute = createMockSerRoute()
      const transaction = createMockTransaction()

      mockQueryRoutes.mockResolvedValue([currentRoute, newRoute])

      await render(
        href('/submit/:route/:transactions', {
          route: encode(currentRoute),
          transactions: encode([transaction]),
        }),
      )

      await userEvent.click(
        screen.getByRole('link', { name: 'Select a different route' }),
      )

      await userEvent.click((await screen.findAllByRole('radio'))[1])

      await userEvent.click(screen.getByRole('button', { name: 'Use' }))

      await expectRouteToBe(
        href('/submit/:route/:transactions', {
          route: encode(newRoute),
          transactions: encode([transaction]),
        }),
      )
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

      it('disables the button to select a different route', async () => {
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
          screen.getByRole('button', { name: 'Select a different route' }),
        ).toBeDisabled()
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
})
