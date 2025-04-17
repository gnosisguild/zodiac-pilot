import { getAccount, getActiveRoute, saveActiveAccount } from '@/accounts'
import { ProvideAccount } from '@/companion'
import { ProvideExecutionRoute } from '@/execution-routes'
import { ProvideProvider } from '@/providers-ui'
import { sentry } from '@/sentry'
import { getActiveTab, sendMessageToCompanionApp } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
} from '@zodiac/messages'
import {
  Outlet,
  redirect,
  useLoaderData,
  type LoaderFunctionArgs,
} from 'react-router'
import { getActiveAccountId } from './getActiveAccountId'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const activeAccountId = getActiveAccountId(params)

  try {
    const [account, route] = await Promise.all([
      getAccount(activeAccountId, {
        signal: request.signal,
      }),
      getActiveRoute(activeAccountId, {
        signal: request.signal,
      }),
    ])

    await saveActiveAccount(account)

    const activeTab = await getActiveTab()

    if (activeTab.id != null) {
      await sendMessageToCompanionApp(activeTab.id, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: account.id,
      })
    }

    return {
      route,
      account,
    }
  } catch (error) {
    await saveActiveAccount(null)

    sentry.captureException(error)

    throw redirect('/')
  }
}

const ActiveRoute = () => {
  const { route, account } = useLoaderData<typeof loader>()

  useTabMessageHandler(
    CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
    async (_, { tabId }) => {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: account.id,
      })
    },
  )

  return (
    <ProvideAccount account={account}>
      <ProvideExecutionRoute route={route}>
        <ProvideProvider>
          <Outlet />
        </ProvideProvider>
      </ProvideExecutionRoute>
    </ProvideAccount>
  )
}

export default ActiveRoute
