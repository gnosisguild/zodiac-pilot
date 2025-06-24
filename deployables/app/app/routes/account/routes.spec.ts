import { render } from '@/test-utils'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { dbClient, getRoute, getRoutes, getWalletByAddress } from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import { randomAddress } from '@zodiac/test-utils'
import { href } from 'react-router'
import { queryInitiators, queryRoutes } from 'ser-kit'
import { getAddress } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('ser-kit', async (importOriginal) => {
  const module = await importOriginal<typeof import('ser-kit')>()

  return {
    ...module,

    queryInitiators: vi.fn(),
    queryRoutes: vi.fn(),
  }
})

const mockQueryInitiators = vi.mocked(queryInitiators)
const mockQueryRoutes = vi.mocked(queryRoutes)

describe('Routes', () => {
  beforeEach(() => {
    mockQueryRoutes.mockResolvedValue([])
    mockQueryInitiators.mockResolvedValue([])
  })

  describe('Pilot Signer', () => {
    it('lists all wallets that can be signers on the selected account', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)

      const address = randomAddress()

      await walletFactory.create(user, {
        label: 'Test Wallet',
        address,
      })

      mockQueryInitiators.mockResolvedValue([address])

      await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        {
          tenant,
          user,
        },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )

      expect(
        await screen.findByRole('option', { name: 'Test Wallet' }),
      ).toBeInTheDocument()
    })

    it('shows the current initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test Wallet',
      })
      const route = await routeFactory.create(account, wallet)

      mockQueryInitiators.mockResolvedValue([wallet.address])

      await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        {
          tenant,
          user,
        },
      )

      expect(await screen.findByText('Test Wallet')).toBeInTheDocument()
    })

    it('is possible to add an initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user, {
        label: 'Test Wallet',
      })

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Test Wallet' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      const [route] = await getRoutes(dbClient(), tenant.id, {
        accountId: account.id,
      })

      expect(route).toMatchObject({
        fromId: wallet.id,
        toId: account.id,
      })
    })

    it('is possible to remove the initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const wallet = await walletFactory.create(user)
      const route = await routeFactory.create(account, wallet)

      mockQueryInitiators.mockResolvedValue([wallet.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Remove Pilot Signer' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(
        getRoutes(dbClient(), tenant.id, { accountId: account.id }),
      ).resolves.toEqual([])
    })

    it('is possible to update the initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)
      const walletA = await walletFactory.create(user)
      const walletB = await walletFactory.create(user, {
        label: 'Another wallet',
      })

      const route = await routeFactory.create(account, walletA)

      mockQueryInitiators.mockResolvedValue([walletA.address, walletB.address])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: 'Another wallet' }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      await expect(getRoute(dbClient(), route.id)).resolves.toMatchObject({
        fromId: walletB.id,
        toId: account.id,
      })
    })

    it('is possible to create an initiator wallet on the fly', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)

      const walletAddress = randomAddress()

      mockQueryInitiators.mockResolvedValue([walletAddress])

      const { waitForPendingActions, waitForPendingLoaders } = await render(
        href('/account/:accountId/route/:routeId?', { accountId: account.id }),
        { tenant, user },
      )

      await userEvent.click(
        await screen.findByRole('combobox', { name: 'Pilot Signer' }),
      )
      await userEvent.click(
        await screen.findByRole('option', { name: getAddress(walletAddress) }),
      )

      await waitForPendingLoaders()

      await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

      await waitForPendingActions()

      const [route] = await getRoutes(dbClient(), tenant.id, {
        accountId: account.id,
      })

      const wallet = await getWalletByAddress(dbClient(), user, walletAddress)

      expect(route).toHaveProperty('fromId', wallet.id)
    })
  })

  describe('Label', () => {
    it('is possible to change the label of a route', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user)
      const route = await routeFactory.create(account, wallet, {
        label: 'Test route',
      })

      const { waitForPendingActions } = await render(
        href('/account/:accountId/route/:routeId?', {
          accountId: account.id,
          routeId: route.id,
        }),
        { user, tenant, features: ['multiple-routes'] },
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Edit route label' }),
      )
      await userEvent.type(
        await screen.findByRole('textbox', { name: 'Label' }),
        ' Updated',
      )
      await userEvent.click(
        await screen.findByRole('button', { name: 'Update' }),
      )

      await waitForPendingActions()

      expect(
        await screen.findByRole('tab', { name: `${route.label} Updated` }),
      ).toBeInTheDocument()
    })
  })
})
