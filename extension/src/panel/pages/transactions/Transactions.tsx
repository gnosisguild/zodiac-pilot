import {
  GhostButton,
  Info,
  infoToast,
  Page,
  PilotLogo,
  SecondaryButton,
} from '@/components'
import { useExecutionRoute } from '@/execution-routes'
import { ForkProvider } from '@/providers'
import { useProvider } from '@/providers-ui'
import { useDispatch, useTransactions } from '@/state'
import { useGloballyApplicableTranslation } from '@/transaction-translation'
import { invariant } from '@epic-web/invariant'
import { Copy, RefreshCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { RecordingIcon } from './RecordingIcon'
import { RouteBubble } from './RouteBubble'
import { Submit } from './Submit'
import { Transaction } from './Transaction'

export const Transactions = () => {
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()
  const route = useExecutionRoute()

  // for now we assume global translations are generally auto-applied, so we don't need to show a button for them
  useGloballyApplicableTranslation()

  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const [scrollItemIntoView, setScrollItemIntoView] = useState<
    number | undefined
  >(undefined)

  const lengthRef = useRef(0)
  useEffect(() => {
    if (transactions.length > lengthRef.current) {
      setScrollItemIntoView(transactions.length - 1)
    }

    lengthRef.current = transactions.length
  }, [transactions])

  const reforkAndRerun = async () => {
    // remove all transactions from the store
    dispatch({
      type: 'REMOVE_TRANSACTION',
      payload: { id: transactions[0].id },
    })

    invariant(
      provider instanceof ForkProvider,
      'This is only supported when using ForkProvider'
    )

    await provider.deleteFork()

    // re-simulate all new transactions (assuming the already submitted ones have already been mined on the fresh fork)
    for (const transaction of transactions) {
      await provider.sendMetaTransaction(transaction.transaction)
    }
  }

  const copyTransactionData = async () => {
    const metaTransactions = transactions.map((txState) => txState.transaction)

    navigator.clipboard.writeText(
      JSON.stringify(metaTransactions, undefined, 2)
    )
    infoToast({
      title: 'Copied!',
      message: 'Transaction data has been copied to clipboard.',
    })
  }

  return (
    <Page>
      <Page.Header>
        <RouteBubble />

        <div className="mt-4 flex items-center justify-between gap-2">
          <h4>Recording Transactions</h4>

          <div className="flex gap-1">
            <GhostButton
              iconOnly
              icon={Copy}
              disabled={transactions.length === 0}
              onClick={copyTransactionData}
            >
              Copy batch transaction data to clipboard
            </GhostButton>

            <GhostButton
              iconOnly
              icon={RefreshCcw}
              disabled={transactions.length === 0}
              onClick={reforkAndRerun}
            >
              Re-simulate on current blockchain head
            </GhostButton>

            <RecordingIcon />
          </div>
        </div>
      </Page.Header>

      <Page.Content ref={scrollContainerRef}>
        {transactions.map((transactionState, index) => (
          <Transaction
            key={transactionState.id}
            transactionState={transactionState}
            index={index}
            scrollIntoView={scrollItemIntoView === index}
          />
        ))}

        {transactions.length === 0 && (
          <div className="mt-32 flex flex-col gap-32">
            <div className="text-gray-400 dark:text-gray-600">
              <PilotLogo />
            </div>

            <Info>
              As you interact with apps in the browser, transactions will be
              recorded here. You can then sign and submit them as a batch.
            </Info>
          </div>
        )}
      </Page.Content>

      <Page.Footer>
        {!route.initiator && (
          <SecondaryButton
            onClick={copyTransactionData}
            disabled={transactions.length === 0}
          >
            Copy transaction data
          </SecondaryButton>
        )}

        <Submit />
      </Page.Footer>
    </Page>
  )
}