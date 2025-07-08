import { getAvailableChains } from '@/balances-server'
import {
  createMockChain,
  expectMessage,
  postMessage,
  render,
} from '@/test-utils'
import { isSmartContractAddress } from '@/utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chain, CHAIN_NAME } from '@zodiac/chains'
import { dbClient, getAccounts } from '@zodiac/db'
import {
  tenantFactory,
  userFactory,
  workspaceFactory,
} from '@zodiac/db/test-utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
} from '@zodiac/messages'
import { createMockExecutionRoute } from '@zodiac/modules/test-utils'
import {
  expectRouteToBe,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/utils', async (importOriginal) => {
  const module = await importOriginal<typeof import('@/utils')>()

  return {
    ...module,

    isSmartContractAddress: vi.fn(),
  }
})

const mockIsSmartContractAddress = vi.mocked(isSmartContractAddress)
const mockGetAvailableChains = vi.mocked(getAvailableChains)

vi.mock('react-router', async (importOriginal) => {
  const module = await importOriginal<typeof import('react-router')>()

  return {
    ...module,

    redirectDocument: vi.fn(),
  }
})

describe('New SafeAccount', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue(
      Object.entries(CHAIN_NAME).map(([chainId, name]) =>
        createMockChain({ community_id: parseInt(chainId), name }),
      ),
    )

    mockIsSmartContractAddress.mockResolvedValue(true)
  })

  it('creates a new account in the DB', async () => {
    const user = await userFactory.create()
    const tenant = await tenantFactory.create(user)
    const workspace = await workspaceFactory.create(tenant, user)

    const { waitForPendingActions } = await render(
      href('/workspace/:workspaceId/accounts/create/:prefixedAddress?', {
        workspaceId: workspace.id,
      }),
      {
        tenant,
        user,
        connected: false,
      },
    )

    const address = randomAddress()

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Address' }),
      address,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitForPendingActions()

    const [account] = await getAccounts(dbClient(), {
      tenantId: tenant.id,
      userId: user.id,
    })

    expect(account).toHaveProperty('address', address)
    expect(account).toHaveProperty('chainId', Chain.ETH)
    expect(account).toHaveProperty('createdById', user.id)
  })

  describe('Label', () => {
    it('is possible to give label the account', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const workspace = await workspaceFactory.create(tenant, user)

      await render(
        href('/workspace/:workspaceId/accounts/create/:prefixedAddress?', {
          workspaceId: workspace.id,
        }),
        { tenant, user },
      )

      const address = randomAddress()

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Address' }),
        address,
      )

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Label' }),
        'Test label',
      )

      await userEvent.click(screen.getByRole('button', { name: 'Create' }))

      await expectMessage({
        type: CompanionAppMessageType.SAVE_AND_LAUNCH,
        data: expect.objectContaining({
          label: 'Test label',
        }),
      })
    })

    describe('Save', () => {
      it('redirects to the accounts page', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)
        const workspace = await workspaceFactory.create(tenant, user)

        await render(
          href('/workspace/:workspaceId/accounts/create/:prefixedAddress?', {
            workspaceId: workspace.id,
          }),
          { tenant, user },
        )

        const address = randomAddress()

        await userEvent.type(
          screen.getByRole('textbox', { name: 'Address' }),
          address,
        )

        const { promise, resolve } = Promise.withResolvers<void>()

        await userEvent.click(screen.getByRole('button', { name: 'Create' }))

        window.addEventListener('message', (message) => {
          if (message.data.type === CompanionAppMessageType.SAVE_AND_LAUNCH) {
            resolve()
          }
        })

        await promise

        await postMessage({
          type: CompanionResponseMessageType.PROVIDE_ROUTE,
          route: createMockExecutionRoute(),
        })

        await expectRouteToBe(
          href('/workspace/:workspaceId/accounts', {
            workspaceId: workspace.id,
          }),
        )
      })
    })
  })

  describe('Predefined account', () => {
    it('is possible to preset the chain', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const workspace = await workspaceFactory.create(tenant, user)

      const prefixedAddress = randomPrefixedAddress({ chainId: Chain.GNO })

      await render(
        href('/workspace/:workspaceId/accounts/create/:prefixedAddress?', {
          prefixedAddress,
          workspaceId: workspace.id,
        }),
        {
          user,
          tenant,
        },
      )

      expect(await screen.findByText('Gnosis')).toBeInTheDocument()
    })

    it('is possible to preset the address', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const workspace = await workspaceFactory.create(tenant, user)

      const address = randomAddress()

      await render(
        href('/workspace/:workspaceId/accounts/create/:prefixedAddress?', {
          prefixedAddress: randomPrefixedAddress({ address }),
          workspaceId: workspace.id,
        }),
        {
          user,
          tenant,
        },
      )

      expect(
        await screen.findByRole('textbox', { name: 'Address' }),
      ).toHaveValue(address)
    })
  })
})
