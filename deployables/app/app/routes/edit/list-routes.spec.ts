import { getAvailableChains } from '@/balances-server'
import {
  loadAndActivateRoute,
  loadRoutes,
  postMessage,
  render,
} from '@/test-utils'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  activateRoute,
  dbClient,
  getAccountByAddress,
  getAccounts,
  getWalletByAddress,
  getWallets,
} from '@zodiac/db'
import {
  accountFactory,
  routeFactory,
  tenantFactory,
  userFactory,
  walletFactory,
} from '@zodiac/db/test-utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { encode } from '@zodiac/schema'
import {
  createMockExecutionRoute,
  expectRouteToBe,
  randomAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetAvailableChains = vi.mocked(getAvailableChains)

describe.sequential('List Routes', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue([])
  })

  describe('List', () => {
    describe('Logged in', () => {
      it('lists all accounts', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)

        await accountFactory.create(tenant, user, {
          label: 'Test account',
        })

        await render(href('/edit'), { tenant, user })

        expect(
          await screen.findByRole('cell', { name: 'Test account' }),
        ).toBeInTheDocument()
      })

      it('shows the currently active initiator', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)
        const account = await accountFactory.create(tenant, user)
        const wallet = await walletFactory.create(user, {
          label: 'Test wallet',
        })
        const route = await routeFactory.create(account, wallet)

        await activateRoute(dbClient(), tenant, user, route)

        await render(href('/edit'), { tenant, user })

        expect(
          await screen.findByRole('cell', { name: 'Test wallet' }),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Edit', () => {
    describe('Logged in', () => {
      it('is possible to edit a route', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)

        const account = await accountFactory.create(tenant, user)

        await render(href('/edit'), {
          tenant,
          user,
        })

        await userEvent.click(
          await screen.findByRole('button', { name: 'Account options' }),
        )
        await userEvent.click(await screen.findByRole('link', { name: 'Edit' }))

        await expectRouteToBe(
          href('/account/:accountId', {
            accountId: account.id,
          }),
        )
      })
    })

    describe('Logged out', () => {
      it('is possible to edit a route', async () => {
        const route = createMockExecutionRoute({ label: 'Test route' })

        await render(href('/edit'), {
          availableRoutes: [route],
        })

        await postMessage({
          type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
          activeRouteId: route.id,
        })

        await userEvent.click(
          await screen.findByRole('button', { name: 'Account options' }),
        )
        await userEvent.click(await screen.findByRole('link', { name: 'Edit' }))

        await postMessage({
          type: CompanionResponseMessageType.PROVIDE_ROUTE,
          route,
        })

        await loadRoutes()

        await expectRouteToBe(
          href('/edit/:routeId/:data', {
            routeId: route.id,
            data: encode(route),
          }),
        )
      })
    })
  })

  describe('Remove', () => {
    describe('Logged in', () => {
      it('is possible to remove an account', async () => {
        const tenant = await tenantFactory.create()
        const user = await userFactory.create(tenant)

        const account = await accountFactory.create(tenant, user)

        const { waitForPendingActions } = await render(href('/edit'), {
          tenant,
          user,
        })

        await userEvent.click(
          await screen.findByRole('button', { name: 'Account options' }),
        )
        await userEvent.click(
          await screen.findByRole('button', { name: 'Delete' }),
        )

        const { getByRole } = within(
          screen.getByRole('dialog', { name: 'Confirm delete' }),
        )

        await userEvent.click(getByRole('button', { name: 'Delete' }))

        await waitForPendingActions()

        const [deletedAccount] = await getAccounts(dbClient(), {
          userId: user.id,
          tenantId: tenant.id,
          deleted: true,
        })

        expect(deletedAccount).toMatchObject({
          id: account.id,

          deleted: true,
          deletedById: user.id,
        })
      })
    })

    describe('Logged out', () => {
      it('is possible to remove an account', async () => {
        const route = createMockExecutionRoute({ label: 'Test route' })
        const mockPostMessage = vi.spyOn(window, 'postMessage')

        await render(href('/edit'), {
          availableRoutes: [route],
        })

        await loadAndActivateRoute(route)

        await userEvent.click(
          await screen.findByRole('button', { name: 'Account options' }),
        )
        await userEvent.click(
          await screen.findByRole('button', { name: 'Delete' }),
        )

        const { getByRole } = within(
          screen.getByRole('dialog', { name: 'Confirm delete' }),
        )

        await userEvent.click(getByRole('button', { name: 'Delete' }))

        expect(mockPostMessage).toHaveBeenCalledWith(
          {
            type: CompanionAppMessageType.DELETE_ROUTE,
            routeId: route.id,
          } satisfies CompanionAppMessage,
          '*',
        )
      })

      it('hides the dialog once the delete is confirmed', async () => {
        const route = createMockExecutionRoute({ label: 'Test route' })

        await render(href('/edit'), {
          availableRoutes: [route],
        })

        await loadAndActivateRoute(route)

        await userEvent.click(
          await screen.findByRole('button', { name: 'Account options' }),
        )
        await userEvent.click(
          await screen.findByRole('button', { name: 'Delete' }),
        )

        const { getByRole } = within(
          screen.getByRole('dialog', { name: 'Confirm delete' }),
        )

        await userEvent.click(getByRole('button', { name: 'Delete' }))

        await postMessage({ type: CompanionResponseMessageType.DELETED_ROUTE })

        await waitFor(() => {
          expect(
            screen.queryByRole('dialog', { name: 'Confirm delete' }),
          ).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('Upload', () => {
    it('is possible to migrate a local account to the cloud', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const avatar = randomPrefixedAddress()
      const route = createMockExecutionRoute({
        avatar,
        initiator: prefixAddress(undefined, randomAddress()),
        label: 'Test account',
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
      })

      await loadAndActivateRoute(route)

      await userEvent.click(
        await screen.findByRole('button', { name: 'Account options' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Upload' }),
      )

      await postMessage({
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })

      await waitForPendingActions()

      const account = await getAccountByAddress(dbClient(), tenant.id, avatar)

      expect(account).toHaveProperty('label', 'Test account')
    })

    it('reuses existing accounts', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const account = await accountFactory.create(tenant, user)

      const avatar = prefixAddress(account.chainId, account.address)

      const route = createMockExecutionRoute({
        avatar,
        initiator: prefixAddress(undefined, randomAddress()),
        label: 'Test account',
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        features: ['user-management'],
      })

      await loadAndActivateRoute(route)

      const { findByRole } = within(
        await screen.findByRole('region', { name: 'Local Accounts' }),
      )

      await userEvent.click(
        await findByRole('button', { name: 'Account options' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Upload' }),
      )

      await postMessage({
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })

      await waitForPendingActions()

      await expect(
        getAccounts(dbClient(), { tenantId: tenant.id, userId: user.id }),
      ).resolves.toHaveLength(1)
    })

    it('creates a wallet for the initiator', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)

      const initiator = randomAddress()

      const route = createMockExecutionRoute({
        initiator: prefixAddress(undefined, initiator),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        features: ['user-management'],
      })

      await loadAndActivateRoute(route)

      const { findByRole } = within(
        await screen.findByRole('region', { name: 'Local Accounts' }),
      )

      await userEvent.click(
        await findByRole('button', { name: 'Account options' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Upload' }),
      )

      await postMessage({
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })

      await waitForPendingActions()

      await expect(
        getWalletByAddress(dbClient(), user, initiator),
      ).resolves.toBeDefined()
    })

    it('reuses existing wallets', async () => {
      const tenant = await tenantFactory.create()
      const user = await userFactory.create(tenant)
      const wallet = await walletFactory.create(user)

      const initiator = wallet.address

      const route = createMockExecutionRoute({
        initiator: prefixAddress(undefined, initiator),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        features: ['user-management'],
      })

      await loadAndActivateRoute(route)

      const { findByRole } = within(
        await screen.findByRole('region', { name: 'Local Accounts' }),
      )

      await userEvent.click(
        await findByRole('button', { name: 'Account options' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Upload' }),
      )

      await postMessage({
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })

      await waitForPendingActions()

      await expect(getWallets(dbClient(), user.id)).resolves.toHaveLength(1)
    })

    it.todo('stores the selected route')
    it.todo('marks the route as active')
    it.todo('does not create duplicates')
    it.todo('removes the local account')
    it.todo('does not remove the local account when the server action fails')
    it.todo('does not offer the upload options when no user is logged in')
  })
})
