import { getActiveAccount } from '@/accounts'
import { getFeatures, ProvideCompanionAppContext } from '@/companion'
import { sendMessageToCompanionApp } from '@/utils'
import { getCompanionAppUrl } from '@zodiac/env'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { FeatureProvider } from '@zodiac/ui'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from 'react-router'
import { ClearTransactionsModal } from './ClearTransactionsModal'
import { useDeleteRoute } from './useDeleteRoute'
import { useSaveRoute } from './useSaveRoute'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const activeAccount = await getActiveAccount()

  return {
    activeAccountId: activeAccount == null ? null : activeAccount.id,
    companionAppUrl: getCompanionAppUrl(),
    features: await getFeatures({ signal: request.signal }),
  }
}

const Root = () => {
  const { activeAccountId, companionAppUrl, features } =
    useLoaderData<typeof loader>()
  const [saveOptions, saveAndActivateOptions] = useSaveRoute(activeAccountId, {
    onSave: (route, tabId) => {
      sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })
    },
  })

  useDeleteRoute()

  const navigate = useNavigate()

  return (
    <FeatureProvider features={features}>
      <ProvideCompanionAppContext url={companionAppUrl}>
        <Outlet />

        <ClearTransactionsModal
          open={saveAndActivateOptions.isActivationPending}
          onCancel={saveAndActivateOptions.cancelActivation}
          onAccept={saveAndActivateOptions.proceedWithActivation}
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
