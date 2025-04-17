import { getAccount, getActiveAccount, saveActiveAccount } from '@/accounts'
import { getFeatures, ProvideCompanionAppContext } from '@/companion'
import {
  formData,
  getActiveTab,
  getString,
  sendMessageToCompanionApp,
} from '@/utils'
import { getCompanionAppUrl } from '@zodiac/env'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { FeatureProvider } from '@zodiac/ui'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigate,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { ClearTransactionsModal } from './ClearTransactionsModal'
import { useDeleteRoute } from './useDeleteRoute'
import { useLaunchRouteOnMessage } from './useLaunchRoute'
import { useSaveRoute } from './useSaveRoute'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const activeAccount = await getActiveAccount()

  return {
    activeAccountId: activeAccount == null ? null : activeAccount.id,
    companionAppUrl: getCompanionAppUrl(),
    features: await getFeatures({ signal: request.signal }),
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()

  const accountId = getString(data, 'accountId')
  const activeAccount = await getActiveAccount({ signal: request.signal })
  const account = await getAccount(accountId, { signal: request.signal })

  await saveActiveAccount(account)

  const activeTab = await getActiveTab()

  if (activeTab.id != null) {
    sendMessageToCompanionApp(activeTab.id, {
      type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
      activeRouteId: accountId,
    })
  }

  if (activeAccount != null) {
    return redirect(`/${activeAccount.id}/clear-transactions/${accountId}`)
  }

  return redirect(`/${accountId}`)
}

const Root = () => {
  const submit = useSubmit()

  const { activeAccountId, companionAppUrl, features } =
    useLoaderData<typeof loader>()
  const [saveOptions, saveAndLaunchOptions] = useSaveRoute(activeAccountId, {
    onSave: (route, tabId) => {
      sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })
    },
  })

  useDeleteRoute()

  const { isLaunchPending, cancelLaunch, proceedWithLaunch } =
    useLaunchRouteOnMessage({
      onLaunch(accountId) {
        submit(formData({ accountId }), { method: 'POST' })
      },
    })

  const navigate = useNavigate()

  return (
    <FeatureProvider features={features}>
      <ProvideCompanionAppContext url={companionAppUrl}>
        <Outlet />

        <ClearTransactionsModal
          open={isLaunchPending}
          onCancel={cancelLaunch}
          onAccept={proceedWithLaunch}
        />

        <ClearTransactionsModal
          open={saveAndLaunchOptions.isLaunchPending}
          onCancel={saveAndLaunchOptions.cancelLaunch}
          onAccept={saveAndLaunchOptions.proceedWithLaunch}
        />

        <ClearTransactionsModal
          open={saveOptions.isUpdatePending}
          onCancel={saveOptions.cancelUpdate}
          onAccept={() => {
            saveOptions.saveUpdate().then((updatedRoute) => {
              navigate(
                `/${updatedRoute.id}/clear-transactions/${updatedRoute.id}`,
              )
            })
          }}
        />
      </ProvideCompanionAppContext>
    </FeatureProvider>
  )
}

export default Root
