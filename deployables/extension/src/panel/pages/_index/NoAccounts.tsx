import { useSaveAccount } from '@/accounts'
import { useCompanionAppUrl } from '@/companion'
import { useBridgeError } from '@/port-handling'
import { sendMessageToCompanionApp } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
} from '@zodiac/messages'
import { Info, Page, PrimaryLinkButton } from '@zodiac/ui'
import { Plus } from 'lucide-react'
import { useEffect } from 'react'

const NoAccounts = () => {
  useBridgeError(
    'To use Zodiac Pilot with a dApp you need to create an account.',
  )

  useTabMessageHandler(
    CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
    async (_, { tabId }) => {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: null,
      })
    },
  )

  const [saveOptions, saveAndLaunchOptions] = useSaveAccount(null, {
    async onSave(route, _, tabId) {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })
    },
  })

  useEffect(() => {
    if (saveOptions.isUpdatePending) {
      saveOptions.saveUpdate()
    }
  }, [saveOptions])

  useEffect(() => {
    if (saveAndLaunchOptions.isActivationPending) {
      saveAndLaunchOptions.proceedWithActivation()
    }
  }, [saveAndLaunchOptions])

  return (
    <Page>
      <Page.Content>
        <div className="relative top-1/4 flex flex-1 flex-col items-center gap-8">
          <h2 className="mt-1 text-2xl font-light">Welcome to Zodiac Pilot</h2>

          <Info>
            You haven't created any routes, yet. Click the button below to
            create your first route.
          </Info>
        </div>
      </Page.Content>

      <Page.Footer>
        <PrimaryLinkButton
          openInNewWindow
          icon={Plus}
          to={`${useCompanionAppUrl()}/create`}
        >
          Add account
        </PrimaryLinkButton>
      </Page.Footer>
    </Page>
  )
}

export default NoAccounts
