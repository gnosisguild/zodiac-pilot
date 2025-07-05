import { authorizedAction, authorizedLoader } from '@/auth-server'
import { getRouteId, RouteSelect } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  createRoute,
  dbClient,
  findDefaultRoute,
  getAccount,
  getOrCreateWallet,
  getRoute,
  getRoutes,
  getWallet,
  getWallets,
  removeRoute,
  setDefaultRoute,
  updateRouteLabel,
} from '@zodiac/db'
import { getBoolean, getHexString, getString, getUUID } from '@zodiac/form-data'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import { queryRoutes } from '@zodiac/modules'
import { addressSchema, isUUID, type HexAddress } from '@zodiac/schema'
import {
  AddressSelect,
  Form,
  Modal,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from '@zodiac/ui'
import type { UUID } from 'crypto'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { href, redirect, useLoaderData, useOutletContext } from 'react-router'
import { prefixAddress, queryInitiators } from 'ser-kit'
import type { Route } from './+types/routes'
import { RouteTab } from './RouteTab'
import { Intent } from './intents'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { accountId, routeId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      const url = new URL(request.url)

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')
      invariantResponse(
        routeId == null || isUUID(routeId),
        '"routeId" is not a UUID',
      )

      const [account, wallets, routes, route, defaultRoute] = await Promise.all(
        [
          getAccount(dbClient(), accountId),
          getWallets(dbClient(), user.id),
          getRoutes(dbClient(), tenant.id, { accountId, userId: user.id }),
          routeId == null ? null : await getRoute(dbClient(), routeId),
          findDefaultRoute(dbClient(), tenant, user, accountId),
        ],
      )

      const initiators = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )

      const initiatorAddress = await findInitiator({
        routeId,
        searchParams: url.searchParams,
      })

      const possibleRoutes =
        initiatorAddress == null
          ? { routes: [] }
          : await queryRoutes(
              prefixAddress(undefined, initiatorAddress),
              prefixAddress(account.chainId, account.address),
            )

      const [defaultProposedRoute] = possibleRoutes.routes

      return {
        possibleInitiators: [
          ...wallets
            .filter((wallet) => initiators.includes(wallet.address))
            .map(({ address, label }) => ({ address, label })),
          ...initiators
            .filter((address) =>
              wallets.every((wallet) => wallet.address !== address),
            )
            .map((address) => ({ address, label: address })),
        ],
        initiatorAddress,
        possibleRoutes: possibleRoutes.routes,
        routes,
        defaultRouteId: defaultRoute == null ? null : defaultRoute.routeId,
        comparableId:
          route == null
            ? defaultProposedRoute == null
              ? undefined
              : getRouteId(defaultProposedRoute.waypoints)
            : getRouteId(route.waypoints),
      }
    },
    { ensureSignedIn: true },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { accountId, workspaceId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      const data = await request.formData()

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      switch (getString(data, 'intent')) {
        case Intent.EditRoute: {
          const routeId = getUUID(data, 'routeId')
          const label = getString(data, 'label')
          const setAsDefault = getBoolean(data, 'defaultRoute')

          await dbClient().transaction(async (tx) => {
            const route = await getRoute(tx, routeId)
            const defaultRoute = await findDefaultRoute(
              tx,
              tenant,
              user,
              accountId,
            )

            if (route.label !== label) {
              await updateRouteLabel(tx, routeId, label)
            }

            if (setAsDefault) {
              if (defaultRoute == null || defaultRoute.routeId !== routeId) {
                await setDefaultRoute(tx, tenant, user, route)
              }
            }
          })

          return null
        }

        case Intent.RemoveRoute: {
          const routeId = getUUID(data, 'routeId')

          await removeRoute(dbClient(), routeId)

          const defaultRoute = await findDefaultRoute(
            dbClient(),
            tenant,
            user,
            accountId,
          )

          if (defaultRoute != null) {
            return redirect(
              href(
                '/workspace/:workspaceId/account/:accountId/route/:routeId?',
                {
                  accountId,
                  workspaceId,
                  routeId: defaultRoute.routeId,
                },
              ),
            )
          }

          const [route] = await getRoutes(dbClient(), tenant.id, {
            accountId,
            userId: user.id,
          })

          if (route != null) {
            return redirect(
              href(
                '/workspace/:workspaceId/account/:accountId/route/:routeId?',
                {
                  accountId,
                  workspaceId,
                  routeId: route.id,
                },
              ),
            )
          }

          return redirect(
            href('/workspace/:workspaceId/account/:accountId/route/:routeId?', {
              accountId,
              workspaceId,
            }),
          )
        }

        case Intent.AddRoute: {
          const initiator = getHexString(data, 'initiator')
          const label = getString(data, 'label')

          const wallet = await getOrCreateWallet(dbClient(), user, {
            label: 'Unnamed wallet',
            address: initiator,
          })
          const account = await getAccount(dbClient(), accountId)

          const queryRoutesResult = await queryRoutes(
            prefixAddress(undefined, initiator),
            prefixAddress(account.chainId, account.address),
          )

          const [defaultRoute] = queryRoutesResult.routes

          const route = await createRoute(dbClient(), tenant.id, {
            walletId: wallet.id,
            accountId: account.id,
            waypoints: defaultRoute.waypoints,
            label,
          })

          return redirect(
            href('/workspace/:workspaceId/account/:accountId/route/:routeId?', {
              accountId,
              workspaceId,
              routeId: route.id,
            }),
          )
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { routeId, accountId } }) {
        if (routeId == null) {
          invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

          const account = await getAccount(dbClient(), accountId)

          return account.tenantId === tenant.id
        }

        invariantResponse(isUUID(routeId), '"routeId" is not a UUID')

        const route = await getRoute(dbClient(), routeId)

        return route.tenantId === tenant.id && route.toId === accountId
      },
    },
  )

const Routes = ({
  loaderData: {
    initiatorAddress,
    possibleInitiators,
    possibleRoutes,
    comparableId,
    routes,
    defaultRouteId,
  },
  params: { routeId },
}: Route.ComponentProps) => {
  const { formId } = useOutletContext<{ formId: string }>()

  return (
    <>
      <div
        role="tablist"
        className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-600"
      >
        <div className="flex items-center gap-2">
          {routes.map((route) => (
            <RouteTab
              key={route.id}
              route={route}
              isDefault={defaultRouteId != null && route.id === defaultRouteId}
            />
          ))}
        </div>

        <AddRoute />
      </div>

      <input
        type="hidden"
        form={formId}
        name="initiator"
        value={initiatorAddress ?? ''}
      />
      <input type="hidden" form={formId} name="routeId" value={routeId ?? ''} />

      <Form method="GET">
        {({ submit }) => (
          <AddressSelect
            isClearable
            key={routeId}
            isMulti={false}
            label="Pilot Signer"
            clearLabel="Remove Pilot Signer"
            name="transient-initiator"
            placeholder="Select a wallet form the list"
            defaultValue={initiatorAddress ?? undefined}
            options={possibleInitiators}
            onChange={submit}
          />
        )}
      </Form>

      <RouteSelect
        key={routeId}
        routes={possibleRoutes}
        defaultValue={comparableId}
        form={formId}
        name="serRouteId"
        initiator={
          initiatorAddress == null
            ? undefined
            : prefixAddress(undefined, initiatorAddress)
        }
      />
    </>
  )
}

export default Routes

type FindInitiatorOptions = {
  routeId?: UUID
  searchParams: URLSearchParams
}

const findInitiator = async ({
  routeId,
  searchParams,
}: FindInitiatorOptions): Promise<HexAddress | null> => {
  if (searchParams.has('transient-initiator')) {
    const initiator = searchParams.get('transient-initiator')

    if (initiator === '') {
      return null
    }

    const address = addressSchema.parse(initiator)

    return address
  }

  if (routeId != null) {
    const route = await getRoute(dbClient(), routeId)
    const wallet = await getWallet(dbClient(), route.fromId)

    return wallet.address
  }

  return null
}

const AddRoute = () => {
  const [adding, setAdding] = useState(false)

  const { possibleInitiators } = useLoaderData<typeof loader>()

  useAfterSubmit(Intent.AddRoute, () => setAdding(false))

  return (
    <>
      <SecondaryButton size="small" icon={Plus} onClick={() => setAdding(true)}>
        Add route
      </SecondaryButton>

      <Modal title="Add route" open={adding} onClose={() => setAdding(false)}>
        <Form>
          <TextInput
            required
            label="Label"
            name="label"
            placeholder="New route"
          />

          <AddressSelect
            required
            isMulti={false}
            label="Pilot Signer"
            name="initiator"
            placeholder="Select a wallet form the list"
            options={possibleInitiators}
          />

          <Modal.Actions>
            <PrimaryButton
              submit
              intent={Intent.AddRoute}
              busy={useIsPending(Intent.AddRoute)}
            >
              Add
            </PrimaryButton>
            <Modal.CloseAction>Cancel</Modal.CloseAction>
          </Modal.Actions>
        </Form>
      </Modal>
    </>
  )
}
