import { editAccount, getAccount } from '@/accounts'
import { getUser, useAccount } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import { useProviderBridge } from '@/inject-bridge'
import { usePilotIsReady } from '@/port-handling'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useDispatch, useTransactions } from '@/state'
import { useGloballyApplicableTranslation } from '@/transaction-translation'
import { invariant } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import { getInt, getString } from '@zodiac/form-data'
import {
  CopyToClipboard,
  Feature,
  GhostButton,
  Info,
  InlineForm,
  Page,
} from '@zodiac/ui'
import { Cloud, CloudOff, RefreshCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import {
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { RecordingIndicator } from './RecordingIndicator'
import { Submit } from './Submit'
import { Transaction } from './Transaction'
import { Intent } from './intents'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {
    user: await getUser({ signal: request.signal }),
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()

  const intent = getString(data, 'intent')

  switch (intent) {
    case Intent.Login: {
      await chrome.identity.launchWebAuthFlow({
        url: `${getCompanionAppUrl()}/extension/sign-in`,
        interactive: true,
      })

      return null
    }

    case Intent.EditAccount: {
      const windowId = getInt(data, 'windowId')

      const accountId = getString(data, 'accountId')
      const account = await getAccount(accountId, { signal: request.signal })

      await editAccount(windowId, account)

      return null
    }
  }
}

const Transactions = () => {
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()
  const account = useAccount()
  const route = useExecutionRoute()
  const pilotIsReady = usePilotIsReady()
  const { user } = useLoaderData<typeof loader>()

  useProviderBridge({
    provider,
    chainId: account.chainId,
    account: account.address,
  })

  // for now we assume global translations are generally auto-applied, so we don't need to show a button for them
  useGloballyApplicableTranslation()

  const scrollContainerRef = useScrollIntoView()

  const reforkAndRerun = async () => {
    // remove all transactions from the store
    dispatch({
      type: 'CLEAR_TRANSACTIONS',
      payload: { id: transactions[0].id },
    })

    invariant(
      provider instanceof ForkProvider,
      'This is only supported when using ForkProvider',
    )

    await provider.deleteFork()

    // re-simulate all new transactions (assuming the already submitted ones have already been mined on the fresh fork)
    for (const transaction of transactions) {
      await provider.sendMetaTransaction(transaction.transaction)
    }
  }

  return (
    <>
      <Page.Content ref={scrollContainerRef}>
        <div className="flex items-center justify-between gap-2">
          <RecordingIndicator />

          <div className="flex gap-1">
            <CopyToClipboard
              iconOnly
              disabled={transactions.length === 0}
              size="small"
              data={transactions.map((txState) => txState.transaction)}
            >
              Copy batch transaction data to clipboard
            </CopyToClipboard>

            <GhostButton
              iconOnly
              size="small"
              icon={RefreshCcw}
              disabled={transactions.length === 0}
              onClick={reforkAndRerun}
            >
              Re-simulate on current blockchain head
            </GhostButton>

            <Feature feature="user-management">
              <InlineForm>
                {user == null ? (
                  <GhostButton
                    iconOnly
                    submit
                    intent={Intent.Login}
                    size="small"
                    icon={CloudOff}
                  >
                    Log into Zodiac OS
                  </GhostButton>
                ) : (
                  <GhostButton iconOnly size="small" icon={Cloud}>
                    View Profile
                  </GhostButton>
                )}
              </InlineForm>
            </Feature>
          </div>
        </div>

        {transactions.map((transactionState) => (
          <div id={`t-${transactionState.id}`} key={transactionState.id}>
            <Transaction transactionState={transactionState} />
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="mt-32 flex flex-col gap-32">
            <Info>
              As you interact with apps in the browser, transactions will be
              recorded here. You can then sign and submit them as a batch.
            </Info>
          </div>
        )}
      </Page.Content>

      <Page.Footer>
        {!route.initiator && pilotIsReady && (
          <CopyToClipboard
            data={transactions.map((txState) => txState.transaction)}
            disabled={transactions.length === 0}
          >
            Copy transaction data
          </CopyToClipboard>
        )}

        <Submit />
      </Page.Footer>
    </>
  )
}

const useScrollIntoView = () => {
  const transactions = useTransactions()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const currentTransactionsRef = useRef(transactions)

  useEffect(() => {
    if (currentTransactionsRef.current.length < transactions.length) {
      const lastTransaction = transactions.at(-1)

      invariant(lastTransaction != null, 'Could not get new transaction')

      if (scrollContainerRef.current != null) {
        const element = scrollContainerRef.current.querySelector(
          `#t-${lastTransaction.id}`,
        )

        if (element != null) {
          element.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth',
            inline: 'center',
          })
        }
      }
    }

    currentTransactionsRef.current = transactions
  }, [transactions])

  return scrollContainerRef
}

export default Transactions
