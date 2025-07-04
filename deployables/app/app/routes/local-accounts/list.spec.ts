import { getAvailableChains } from '@/balances-server'
import {
  expectMessage,
  loadAndActivateRoute,
  loadRoutes,
  postMessage,
  render,
} from '@/test-utils'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  dbClient,
  getAccountByAddress,
  getAccounts,
  getDefaultRoute,
  getRoutes,
  getWalletByAddress,
  getWallets,
  setDefaultRoute,
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
  randomEoaAddress,
  randomPrefixedAddress,
} from '@zodiac/test-utils'
import { href } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetAvailableChains = vi.mocked(getAvailableChains)

describe.sequential('List Accounts', () => {
  beforeEach(() => {
    mockGetAvailableChains.mockResolvedValue([])
  })

  describe('List', () => {
    describe('Logged in', () => {
      it('lists all accounts', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

        await accountFactory.create(tenant, user, {
          label: 'Test account',
        })

        await render(href('/edit'), { tenant, user })

        expect(
          await screen.findByRole('cell', { name: 'Test account' }),
        ).toBeInTheDocument()
      })
    })
  })

  describe('Edit', () => {
    describe('Logged in', () => {
      it('is possible to edit a route', async () => {
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

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
          href('/account/:accountId/route/:routeId?', {
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
        const user = await userFactory.create()
        const tenant = await tenantFactory.create(user)

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
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const avatar = randomPrefixedAddress()
      const route = createMockExecutionRoute({
        avatar,
        initiator: randomEoaAddress(),
        label: 'Test account',
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
      })

      await loadAndActivateRoute(route)

      await userEvent.click(
        await screen.findByRole('button', { name: 'Account options' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Upload' }),
      )

      await waitForPendingActions()

      const account = await getAccountByAddress(dbClient(), {
        tenantId: tenant.id,
        prefixedAddress: avatar,
      })

      expect(account).toHaveProperty('label', 'Test account')
    })

    it('reuses existing accounts', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const account = await accountFactory.create(tenant, user)

      const avatar = prefixAddress(account.chainId, account.address)

      const route = createMockExecutionRoute({
        avatar,
        initiator: randomEoaAddress(),
        label: 'Test account',
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
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

      await waitForPendingActions()

      await expect(
        getAccounts(dbClient(), { tenantId: tenant.id, userId: user.id }),
      ).resolves.toHaveLength(1)
    })

    it('creates a wallet for the initiator', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const initiator = randomAddress()

      const route = createMockExecutionRoute({
        initiator: prefixAddress(undefined, initiator),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
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

      await waitForPendingActions()

      await expect(
        getWalletByAddress(dbClient(), user, initiator),
      ).resolves.toBeDefined()
    })

    it('reuses existing wallets', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const wallet = await walletFactory.create(user)

      const initiator = wallet.address

      const route = createMockExecutionRoute({
        initiator: prefixAddress(undefined, initiator),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
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

      await waitForPendingActions()

      await expect(getWallets(dbClient(), user.id)).resolves.toHaveLength(1)
    })

    it('stores the selected route', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const initiator = randomAddress()

      const route = createMockExecutionRoute({
        initiator: prefixAddress(undefined, initiator),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
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

      await waitForPendingActions()

      const wallet = await getWalletByAddress(dbClient(), user, initiator)
      const account = await getAccountByAddress(dbClient(), {
        tenantId: tenant.id,
        prefixedAddress: route.avatar,
      })

      const [remoteRoute] = await getRoutes(dbClient(), tenant.id, {
        userId: user.id,
        walletId: wallet.id,
        accountId: account.id,
      })

      expect(remoteRoute).toHaveProperty('waypoints', route.waypoints)
    })

    it('marks the route as active', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const initiator = randomAddress()

      const route = createMockExecutionRoute({
        initiator: prefixAddress(undefined, initiator),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
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

      await waitForPendingActions()

      const wallet = await getWalletByAddress(dbClient(), user, initiator)
      const account = await getAccountByAddress(dbClient(), {
        tenantId: tenant.id,
        prefixedAddress: route.avatar,
      })

      const [remoteRoute] = await getRoutes(dbClient(), tenant.id, {
        userId: user.id,
        walletId: wallet.id,
        accountId: account.id,
      })

      await expect(
        getDefaultRoute(dbClient(), tenant, user, account.id),
      ).resolves.toHaveProperty('routeId', remoteRoute.id)
    })

    it('does not create duplicates', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)
      const wallet = await walletFactory.create(user)
      const account = await accountFactory.create(tenant, user, {
        label: 'Test account',
      })
      const route = await routeFactory.create(account, wallet, {
        label: 'Route A',
      })

      await setDefaultRoute(dbClient(), tenant, user, route)

      const executionRoute = createMockExecutionRoute({
        label: 'Route B',
        initiator: prefixAddress(undefined, wallet.address),
        avatar: prefixAddress(account.chainId, account.address),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [executionRoute],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route: executionRoute,
          },
        },
      })

      await loadAndActivateRoute(executionRoute)

      const { findByRole } = within(
        await screen.findByRole('region', { name: 'Local Accounts' }),
      )

      await userEvent.click(
        await findByRole('button', { name: 'Account options' }),
      )

      await userEvent.click(
        await screen.findByRole('button', { name: 'Upload' }),
      )

      await waitForPendingActions()

      const [, routeB] = await getRoutes(dbClient(), tenant.id, {
        walletId: wallet.id,
        userId: user.id,
        accountId: account.id,
      })

      expect(routeB).toMatchObject({
        label: 'Route B',
        waypoints: executionRoute.waypoints,
      })
    })

    it('removes the local account', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const route = createMockExecutionRoute({
        initiator: randomEoaAddress(),
        avatar: randomPrefixedAddress(),
      })

      await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
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

      await expectMessage({
        type: CompanionAppMessageType.DELETE_ROUTE,
        routeId: route.id,
      })
    })

    it('does not remove the local account when the server action fails', async () => {
      const user = await userFactory.create()
      const tenant = await tenantFactory.create(user)

      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress(),
      })

      const { waitForPendingActions } = await render(href('/edit'), {
        availableRoutes: [route],
        tenant,
        user,
        autoRespond: {
          [CompanionAppMessageType.DELETE_ROUTE]: {
            type: CompanionResponseMessageType.DELETED_ROUTE,
          },
          [CompanionAppMessageType.REQUEST_ROUTE]: {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          },
        },
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

      await waitForPendingActions()

      expect(window.postMessage).not.toHaveBeenCalledWith(
        {
          type: CompanionAppMessageType.DELETE_ROUTE,
          routeId: route.id,
        } satisfies CompanionAppMessage,
        '*',
      )
    })

    it('does not offer the upload options when no user is logged in', async () => {
      const route = createMockExecutionRoute({
        avatar: randomPrefixedAddress(),
      })

      await render(href('/edit'), {
        availableRoutes: [route],
      })

      await loadAndActivateRoute(route)

      await userEvent.click(
        await screen.findByRole('button', { name: 'Account options' }),
      )

      expect(
        screen.queryByRole('button', { name: 'Upload' }),
      ).not.toBeInTheDocument()
    })
  })
})
