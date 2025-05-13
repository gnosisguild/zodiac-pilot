import { findActiveAccount, getAccounts } from '@/accounts'
import { useCompanionAppUrl } from '@/companion'
import { useBridgeError } from '@/providers-ui'
import { sendMessageToCompanionApp } from '@/utils'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
} from '@zodiac/messages'
import { Info, Page, PrimaryLinkButton } from '@zodiac/ui'
import { Plus } from 'lucide-react'
import { redirect } from 'react-router'

export const loader = async () => {
  const activeAccount = await findActiveAccount()

  if (activeAccount != null) {
    return redirect(`/${activeAccount.id}`)
  }

  const [account] = await getAccounts()

  if (account != null) {
    return redirect(`/${account.id}`)
  }
}

const NoRoutes = () => {
  useBridgeError('To use Zodiac Pilot with a dApp you need to create a route.')

  useTabMessageHandler(
    CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
    async (_, { tabId }) => {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: null,
      })
    },
  )

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
          Add route
        </PrimaryLinkButton>
      </Page.Footer>
    </Page>
  )
}

export default NoRoutes
