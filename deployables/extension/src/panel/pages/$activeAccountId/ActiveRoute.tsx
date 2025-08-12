import { getRoute, getRoutes } from '@/accounts'
import { createProposal } from '@/companion'
import { ProvideExecutionRoute } from '@/execution-routes'
import { sentry } from '@/sentry'
import { ProvideForkProvider } from '@/transactions'
import { invariantResponse } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import { getString } from '@zodiac/form-data'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { isUUID, parseTransactionData } from '@zodiac/schema'
import { Divider } from '@zodiac/ui'
import { useRef } from 'react'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useRevalidator,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type Params,
} from 'react-router'
import { RouteSelect } from './RouteSelect'
import { getActiveAccountId } from './getActiveAccountId'
import { Intent } from './intents'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const activeAccountId = getActiveAccountId(params)

  try {
    return {
      accountId: activeAccountId,
      route: await getRoute(getActiveRouteId(params), {
        signal: request.signal,
      }),
      routes: await getRoutes(activeAccountId, { signal: request.signal }),
    }
  } catch (error) {
    sentry.captureException(error)

    throw redirect(`/${activeAccountId}`)
  }
}

export const action = async ({
  request,
  params: { activeAccountId, routeId },
}: ActionFunctionArgs) => {
  const data = await request.formData()

  const intent = getString(data, 'intent')

  switch (intent) {
    case Intent.CreateProposal: {
      const transaction = parseTransactionData(getString(data, 'transaction'))

      invariantResponse(
        isUUID(activeAccountId),
        'Can only create proposals for remote accounts',
      )

      invariantResponse(
        routeId != null,
        'No active route selected to create the proposal',
      )

      const { proposalId } = await createProposal(
        activeAccountId,
        transaction,
        {
          signal: request.signal,
        },
      )

      await chrome.tabs.create({
        active: true,
        url: `${getCompanionAppUrl()}/submit/proposal/${proposalId}/${routeId}`,
      })

      return null
    }
  }
}

const ActiveRoute = () => {
  const { route, routes, accountId } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  useRevalidateOnRoutesUpdate()

  return (
    <ProvideExecutionRoute route={route}>
      {routes.length > 1 && (
        <>
          <Divider />

          <div className="py-2 pl-4 pr-2">
            <RouteSelect
              routes={routes}
              value={route == null ? null : route.id}
              onChange={(routeId) => {
                if (routeId === route.id) {
                  return
                }

                navigate(`/${accountId}/${routeId}`)
              }}
            />
          </div>
        </>
      )}

      <ProvideForkProvider route={route}>
        <Outlet />
      </ProvideForkProvider>
    </ProvideExecutionRoute>
  )
}

export default ActiveRoute

const getActiveRouteId = (params: Params): string => {
  const { routeId } = params

  invariantResponse(routeId != null, 'Could not find routeId param')

  return routeId
}

const useRevalidateOnRoutesUpdate = () => {
  const lastUpdate = useRef<Date>(null)
  const revalidator = useRevalidator()

  useTabMessageHandler(CompanionAppMessageType.PING, ({ lastRoutesUpdate }) => {
    if (lastUpdate.current !== lastRoutesUpdate) {
      revalidator.revalidate()
    }

    lastUpdate.current = lastRoutesUpdate
  })
}
