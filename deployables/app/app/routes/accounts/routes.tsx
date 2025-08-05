import { authorizedLoader } from '@/auth-server'
import { getRouteId, RouteSelect } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccount,
  getRoute,
  getWallet,
  getWallets,
} from '@zodiac/db'
import { queryInitiators, queryRoutes } from '@zodiac/modules'
import { addressSchema, isUUID, type HexAddress } from '@zodiac/schema'
import { Form, Warning } from '@zodiac/ui'
import { AddressSelect } from '@zodiac/web3'
import type { UUID } from 'crypto'
import { Outlet, useOutletContext } from 'react-router'
import { prefixAddress } from 'ser-kit'
import type { Route } from './+types/routes'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { accountId, routeId },
      context: {
        auth: { user },
      },
    }) => {
      const url = new URL(request.url)

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')
      invariantResponse(
        routeId == null || isUUID(routeId),
        '"routeId" is not a UUID',
      )

      const [account, wallets, route] = await Promise.all([
        getAccount(dbClient(), accountId),
        getWallets(dbClient(), user.id),
        routeId == null ? null : await getRoute(dbClient(), routeId),
      ])

      const { initiators, error } = await queryInitiators(
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
        couldQueryInitiators: error == null,
        possibleInitiators:
          error == null
            ? [
                ...wallets
                  .filter((wallet) => initiators.includes(wallet.address))
                  .map(({ address, label }) => ({ address, label })),
                ...initiators
                  .filter((address) =>
                    wallets.every((wallet) => wallet.address !== address),
                  )
                  .map((address) => ({ address, label: address })),
              ]
            : wallets.map(({ address, label }) => ({ address, label })),
        initiatorAddress,
        possibleRoutes: possibleRoutes.routes,
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

const Routes = ({
  loaderData: {
    initiatorAddress,
    possibleInitiators,
    possibleRoutes,
    comparableId,
    couldQueryInitiators,
  },
  params: { routeId },
}: Route.ComponentProps) => {
  const { formId } = useOutletContext<{ formId: string }>()

  return (
    <>
      <input
        type="hidden"
        form={formId}
        name="initiator"
        value={initiatorAddress ?? ''}
      />
      <input type="hidden" form={formId} name="routeId" value={routeId} />

      <Form method="GET">
        {({ submit }) => (
          <>
            {!couldQueryInitiators && (
              <Warning title="Could not retrieve signers">
                We could not query possible pilot signers for this account.
              </Warning>
            )}

            <AddressSelect
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
          </>
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

      <Outlet />
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
