import { authorizedLoader } from '@/auth-server'
import { getRouteId, RouteSelect } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  findActiveRoute,
  getAccount,
  getRoute,
  getRoutes,
  getWallets,
} from '@zodiac/db'
import type { Tenant, User } from '@zodiac/db/schema'
import { queryRoutes } from '@zodiac/modules'
import { addressSchema, isUUID, type HexAddress } from '@zodiac/schema'
import { AddressSelect, Feature, Form } from '@zodiac/ui'
import classNames from 'classnames'
import type { UUID } from 'crypto'
import { href, NavLink, useOutletContext } from 'react-router'
import { prefixAddress, queryInitiators } from 'ser-kit'
import type { Route } from './+types/routes'

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

      const account = await getAccount(dbClient(), accountId)
      const wallets = await getWallets(dbClient(), user.id)

      const initiators = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )

      const initiatorAddress = await findInitiator(tenant, user, {
        accountId: account.id,
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

      const activeRoute = await findActiveRoute(
        dbClient(),
        tenant,
        user,
        account.id,
      )
      const [defaultRoute] = possibleRoutes.routes

      return {
        initiatorWallets: wallets.filter((wallet) =>
          initiators.includes(wallet.address),
        ),
        initiatorAddresses: initiators.filter((address) =>
          wallets.every((wallet) => wallet.address !== address),
        ),
        initiatorAddress,
        possibleRoutes: possibleRoutes.routes,
        routes: await getRoutes(dbClient(), tenant.id, { accountId }),
        comparableId:
          activeRoute == null
            ? defaultRoute == null
              ? undefined
              : getRouteId(defaultRoute.waypoints)
            : getRouteId(activeRoute.route.waypoints),
      }
    },
    { ensureSignedIn: true },
  )

const Routes = ({
  loaderData: {
    initiatorAddress,
    initiatorAddresses,
    initiatorWallets,
    possibleRoutes,
    comparableId,
    routes,
  },
  params: { accountId, routeId },
}: Route.ComponentProps) => {
  const { formId } = useOutletContext<{ formId: string }>()

  return (
    <>
      <Feature feature="multiple-routes">
        <div
          role="tablist"
          className="flex items-center gap-2 border-b border-zinc-600"
        >
          {routes.map((route) => (
            <NavLink
              key={route.id}
              to={href('/account/:accountId/route/:routeId?', {
                accountId,
                routeId: route.id,
              })}
              role="tab"
              className={({ isActive }) =>
                classNames(
                  'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                  isActive
                    ? 'border-indigo-500 text-indigo-600 dark:border-teal-300 dark:text-teal-500'
                    : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-50',
                )
              }
            >
              {route.label || 'Unnamed route'}
            </NavLink>
          ))}
        </div>
      </Feature>

      <input
        type="hidden"
        form={formId}
        name="initiator"
        value={initiatorAddress ?? ''}
      />

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
        name="routeId"
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
  accountId: UUID
  routeId?: UUID
  searchParams: URLSearchParams
}

const findInitiator = async (
  tenant: Tenant,
  user: User,
  { accountId, routeId, searchParams }: FindInitiatorOptions,
): Promise<HexAddress | null> => {
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

  const activeRoute = await findActiveRoute(dbClient(), tenant, user, accountId)

  if (activeRoute == null) {
    return null
  }

  return activeRoute.route.wallet.address
}
