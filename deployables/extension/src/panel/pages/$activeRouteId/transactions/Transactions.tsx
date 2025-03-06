import { useCompanionAppUrl } from '@/companion'
import { getRoute, useExecutionRoute } from '@/execution-routes'
import { useProviderBridge } from '@/inject-bridge'
import { usePilotIsReady } from '@/port-handling'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useDispatch, useTransactions } from '@/state'
import { useGloballyApplicableTranslation } from '@/transaction-translation'
import { invariant } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import { getCompanionAppUrl } from '@zodiac/env'
import { getInt, getString } from '@zodiac/form-data'
import { encode } from '@zodiac/schema'
import {
  CopyToClipboard,
  GhostButton,
  GhostLinkButton,
  Info,
  Page,
} from '@zodiac/ui'
import { ArrowUpFromLine, Landmark, RefreshCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { ActionFunctionArgs } from 'react-router'
import { unprefixAddress } from 'ser-kit'
import { RecordingIndicator } from './RecordingIndicator'
import { RouteBubble } from './RouteBubble'
import { Submit } from './Submit'
import { Transaction } from './Transaction'

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()
  const windowId = getInt(data, 'windowId')
  const routeId = getString(data, 'routeId')
  const route = await getRoute(routeId)

  const tabs = await chrome.tabs.query({ windowId })
  const existingTab = tabs.find(
    (tab) =>
      tab.url != null &&
      tab.url.startsWith(`${getCompanionAppUrl()}/edit/${routeId}`),
  )

  if (existingTab != null && existingTab.id != null) {
    await chrome.tabs.update(existingTab.id, {
      active: true,
      url: `${getCompanionAppUrl()}/edit/${routeId}/${encode(route)}`,
    })
  } else {
    await chrome.tabs.create({
      active: true,
      url: `${getCompanionAppUrl()}/edit/${routeId}/${encode(route)}`,
    })
  }

  return null
}

export const Transactions = () => {
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()
  const route = useExecutionRoute()
  const pilotIsReady = usePilotIsReady()

  useProviderBridge({
    provider,
    chainId: getChainId(route.avatar),
    account: unprefixAddress(route.avatar),
  })

  // for now we assume global translations are generally auto-applied, so we don't need to show a button for them
  useGloballyApplicableTranslation()

  const scrollContainerRef = useScrollIntoView()

  const reforkAndRerun = async () => {
    // remove all transactions from the store
    dispatch({
      type: 'REMOVE_TRANSACTION',
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
    <Page>
      <Page.Header>
        <RouteBubble />

        <div className="mt-4 flex items-center justify-between gap-2">
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
          </div>
        </div>
      </Page.Header>

      <div className="flex border-b border-zinc-400/80 p-2 dark:border-gray-700/80">
        <GhostLinkButton
          fluid
          openInNewWindow
          size="small"
          icon={ArrowUpFromLine}
          to={`${useCompanionAppUrl()}/tokens/send`}
        >
          Send tokens
        </GhostLinkButton>

        <GhostLinkButton
          fluid
          openInNewWindow
          size="small"
          icon={Landmark}
          to={`${useCompanionAppUrl()}/tokens/balances`}
        >
          View balances
        </GhostLinkButton>
      </div>

      <Page.Content ref={scrollContainerRef}>
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
    </Page>
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
