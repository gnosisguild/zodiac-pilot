import { findActiveAccount } from '@/accounts'
import { getFeatures, getUser, ProvideCompanionAppContext } from '@/companion'
import { sendMessageToCompanionApp } from '@/utils'
import { getCompanionAppUrl } from '@zodiac/env'
import { CompanionResponseMessageType } from '@zodiac/messages'
import { FeatureProvider } from '@zodiac/ui'
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useRevalidator,
  type LoaderFunctionArgs,
} from 'react-router'
import { ClearTransactionsModal } from './ClearTransactionsModal'
import { useDeleteRoute } from './useDeleteRoute'
import { useRevalidateOnSignIn } from './useRevalidateOnSignIn'
import { useSaveRoute } from './useSaveRoute'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const [activeAccount, features, user] = await Promise.all([
    findActiveAccount({ signal: request.signal }),
    getFeatures({ signal: request.signal }),
    getUser({ signal: request.signal }),
  ])

  return {
    activeAccountId: activeAccount == null ? null : activeAccount.id,
    companionAppUrl: getCompanionAppUrl(),
    features,
    user,
  }
}

const Root = () => {
  const { activeAccountId, companionAppUrl, features, user } =
    useLoaderData<typeof loader>()
  const [saveOptions, saveAndActivateOptions] = useSaveRoute(activeAccountId, {
    onSave: (route, tabId) => {
      sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })
    },
  })

  const { revalidate } = useRevalidator()
  const navigate = useNavigate()

  useDeleteRoute({
    onDelete: (deletedAccountId) => {
      if (deletedAccountId === activeAccountId) {
        navigate(`/${activeAccountId}/clear-transactions/${activeAccountId}`)
      } else {
        revalidate()
      }
    },
  })

  useRevalidateOnSignIn(user != null)

  return (
    <FeatureProvider features={features}>
      <ProvideCompanionAppContext url={companionAppUrl} user={user}>
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
            saveOptions.saveUpdate().then((updatedAccount) => {
              navigate(
                `/${updatedAccount.id}/clear-transactions/${updatedAccount.id}`,
              )
            })
          }}
        />
      </ProvideCompanionAppContext>
    </FeatureProvider>
  )
}

export default Root
