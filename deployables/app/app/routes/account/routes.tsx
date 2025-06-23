import { authorizedLoader } from '@/auth-server'
import { getRouteId, RouteSelect } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, findActiveRoute, getAccount, getWallets } from '@zodiac/db'
import { queryRoutes } from '@zodiac/modules'
import { isUUID } from '@zodiac/schema'
import { AddressSelect, Form } from '@zodiac/ui'
import { useOutletContext } from 'react-router'
import { prefixAddress, queryInitiators } from 'ser-kit'
import type { Route } from './+types/routes'
import { findInitiator } from './findInitiator'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      request,
      params: { accountId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      const url = new URL(request.url)

      invariantResponse(isUUID(accountId), '"accountId" is not a UUID')

      const account = await getAccount(dbClient(), accountId)
      const wallets = await getWallets(dbClient(), user.id)

      const initiators = await queryInitiators(
        prefixAddress(account.chainId, account.address),
      )

      const initiatorAddress = await findInitiator(
        tenant,
        user,
        account.id,
        url.searchParams,
      )

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
  },
}: Route.ComponentProps) => {
  const { formId } = useOutletContext<{ formId: string }>()

  return (
    <>
      <input
        type="hidden"
        form={formId}
        name="initiator"
        value={initiatorAddress ?? undefined}
      />

      <Form method="GET">
        {({ submit }) => (
          <AddressSelect
            isClearable
            isMulti={false}
            label="Pilot Signer"
            clearLabel="Remove Pilot Signer"
            name="initiator"
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
