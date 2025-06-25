import { authorizedAction, authorizedLoader } from '@/auth-server'
import { getRouteId, RouteSelect } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  findDefaultRoute,
  getAccount,
  getRoute,
  getRoutes,
  getWallets,
  removeDefaultRoute,
  removeRoute,
  setDefaultRoute,
  updateRouteLabel,
} from '@zodiac/db'
import { getBoolean, getString, getUUID } from '@zodiac/form-data'
import { queryRoutes } from '@zodiac/modules'
import { addressSchema, isUUID, type HexAddress } from '@zodiac/schema'
import { AddressSelect, Feature, Form } from '@zodiac/ui'
import type { UUID } from 'crypto'
import { useOutletContext } from 'react-router'
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
          getRoutes(dbClient(), tenant.id, { accountId }),
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
        initiatorWallets: wallets.filter((wallet) =>
          initiators.includes(wallet.address),
        ),
        initiatorAddresses: initiators.filter((address) =>
          wallets.every((wallet) => wallet.address !== address),
        ),
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
      params: { accountId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      const data = await request.formData()

      switch (getString(data, 'intent')) {
        case Intent.Edit: {
          invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

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
              if (defaultRoute != null && defaultRoute.routeId !== routeId) {
                await removeDefaultRoute(tx, tenant, user, accountId)
              }

              await setDefaultRoute(tx, tenant, user, route)
            }
          })

          return null
        }

        case Intent.Remove: {
          const routeId = getUUID(data, 'routeId')

          await removeRoute(dbClient(), routeId)

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { routeId, accountId } }) {
        if (routeId == null) {
          return false
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
    initiatorAddresses,
    initiatorWallets,
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
      <Feature feature="multiple-routes">
        <div
          role="tablist"
          className="flex items-center gap-2 border-b border-zinc-300 dark:border-zinc-600"
        >
          {routes.map((route) => (
            <RouteTab
              route={route}
              isDefault={defaultRouteId != null && route.id === defaultRouteId}
            />
          ))}
        </div>
      </Feature>

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
            options={[
              ...initiatorWallets.map(({ address, label }) => ({
                address,
                label,
              })),
              ...initiatorAddresses.map((address) => ({
                address,
                label: address,
              })),
            ]}
            onChange={() => submit()}
          />
        )}
      </Form>

      <RouteSelect
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

    return route.wallet.address
  }

  return null
}
