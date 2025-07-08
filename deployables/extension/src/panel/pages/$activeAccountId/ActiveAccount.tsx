import {
  editAccount,
  getAccount,
  getAccounts,
  ProvideAccount,
  saveActiveAccount,
} from '@/accounts'
import { useCompanionAppUrl } from '@/companion'
import { sentry } from '@/sentry'
import {
  getPersistedTransactionState,
  ProvideTransactions,
} from '@/transactions'
import {
  getActiveTab,
  getInt,
  getString,
  sendMessageToCompanionApp,
} from '@/utils'
import { getCompanionAppUrl } from '@zodiac/env'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  useTabMessageHandler,
} from '@zodiac/messages'
import { Blockie, GhostLinkButton, Modal, Page, Spinner } from '@zodiac/ui'
import { ArrowUpFromLine, Landmark } from 'lucide-react'
import { useRef } from 'react'
import {
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useRevalidator,
  useSubmit,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { AccountActions } from './AccountActions'
import { AccountSelect } from './AccountSelect'
import { getActiveAccountId } from './getActiveAccountId'
import { Intent } from './intents'

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const activeAccountId = getActiveAccountId(params)
  const accounts = await getAccounts({ signal: request.signal })

  try {
    const account = await getAccount(activeAccountId, {
      signal: request.signal,
    })

    await saveActiveAccount(account)

    const activeTab = await getActiveTab()

    if (activeTab.id != null) {
      await sendMessageToCompanionApp(activeTab.id, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: account.id,
      })
    }

    return {
      account,
      accounts,
      initialTransactionsSate: await getPersistedTransactionState(),
    }
  } catch (error) {
    await saveActiveAccount(null)

    sentry.captureException(error)

    throw redirect('/')
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const data = await request.formData()

  switch (getString(data, 'intent')) {
    case Intent.EditAccount: {
      const windowId = getInt(data, 'windowId')

      const accountId = getString(data, 'accountId')
      const account = await getAccount(accountId, { signal: request.signal })

      await editAccount(windowId, account)

      return null
    }

    case Intent.ListAccounts: {
      const windowId = getInt(data, 'windowId')
      const tabs = await chrome.tabs.query({ windowId })

      const existingTab = tabs.find(
        (tab) => tab.url != null && tab.url === `${getCompanionAppUrl()}/edit`,
      )

      if (existingTab != null && existingTab.id != null) {
        await chrome.tabs.update(existingTab.id, { active: true })
      } else {
        await chrome.tabs.create({
          active: true,
          url: `${getCompanionAppUrl()}/edit`,
        })
      }

      return null
    }

    case Intent.ActivateAccount: {
      const accountId = getString(data, 'accountId')
      const activeAccountId = getActiveAccountId(params)

      return redirect(`/${activeAccountId}/clear-transactions/${accountId}`)
    }

    case Intent.Login: {
      try {
        await chrome.identity.launchWebAuthFlow({
          url: `${getCompanionAppUrl()}/extension/sign-in`,
          interactive: true,
        })
      } catch {
        console.debug('User did not log in')
      }

      return null
    }
  }
}

const ActiveRoute = () => {
  const { account, accounts, initialTransactionsSate } =
    useLoaderData<typeof loader>()
  const submit = useSubmit()
  const navigation = useNavigation()

  useRevalidateOnAccountsUpdate()

  useTabMessageHandler(
    CompanionAppMessageType.REQUEST_ACTIVE_ROUTE,
    async (_, { tabId }) => {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ACTIVE_ROUTE,
        activeRouteId: account.id,
      })
    },
  )

  const companionAppUrl = useCompanionAppUrl()

  return (
    <>
      <ProvideAccount account={account}>
        <Page>
          <Page.Header>
            <div className="mx-4 my-2 flex items-center gap-2">
              <Blockie address={account.address} className="size-6" />

              <div className="flex-1">
                <AccountSelect
                  accounts={accounts}
                  onSelect={(accountId) =>
                    submit(
                      { intent: Intent.ActivateAccount, accountId },
                      { method: 'POST' },
                    )
                  }
                />
              </div>

              <AccountActions />
            </div>
          </Page.Header>

          <div className="flex p-2">
            <GhostLinkButton
              fluid
              openInNewWindow
              size="small"
              icon={ArrowUpFromLine}
              to={
                account.remote
                  ? `${companionAppUrl}/workspaces/${account.workspaceId}/tokens/send`
                  : `${companionAppUrl}/offline/tokens/send`
              }
            >
              Send tokens
            </GhostLinkButton>

            <GhostLinkButton
              fluid
              openInNewWindow
              size="small"
              icon={Landmark}
              to={
                account.remote
                  ? `${companionAppUrl}/workspaces/${account.workspaceId}/tokens/balances`
                  : `${companionAppUrl}/offline/tokens/balances`
              }
            >
              View balances
            </GhostLinkButton>
          </div>

          <ProvideTransactions
            initialState={initialTransactionsSate ?? undefined}
          >
            <Outlet />
          </ProvideTransactions>
        </Page>
      </ProvideAccount>

      <Modal
        open={navigation.state === 'loading' && navigation.formData == null}
        title="Switching account..."
      >
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Modal>
    </>
  )
}

export default ActiveRoute

const useRevalidateOnAccountsUpdate = () => {
  const lastUpdate = useRef<Date>(null)
  const revalidator = useRevalidator()

  useTabMessageHandler(
    CompanionAppMessageType.PING,
    ({ lastAccountsUpdate }) => {
      if (lastUpdate.current !== lastAccountsUpdate) {
        revalidator.revalidate()
      }

      lastUpdate.current = lastAccountsUpdate
    },
  )
}
