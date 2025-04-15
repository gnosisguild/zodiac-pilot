import { getAccount, ProvideAccount } from '@/companion'
import {
  getRoute,
  ProvideExecutionRoute,
  saveLastUsedAccountId,
  toAccount,
} from '@/execution-routes'
import { ProvideProvider } from '@/providers-ui'
import { sentry } from '@/sentry'
import { getActiveTab, sendMessageToCompanionApp } from '@/utils'
import { CompanionResponseMessageType } from '@zodiac/messages'
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
    const account = await getAccount(activeAccountId, {
      signal: request.signal,
    })
    const route = await getRoute(activeAccountId)

    await saveLastUsedAccountId(account.id)

    const activeTab = await getActiveTab()

    if (activeTab.id != null) {
      await sendMessageToCompanionApp(activeTab.id, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: account.id,
      })
    }

    return {
      route,
      account: account ?? toAccount(route),
    }
  } catch (error) {
    await saveLastUsedAccountId(null)

    sentry.captureException(error)

    throw redirect('/')
  }
}

const ActiveRoute = () => {
  const { route, account } = useLoaderData<typeof loader>()

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
