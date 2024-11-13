import { Button, IconButton } from '@/components'
import { ForkProvider, useProvider } from '@/providers'
import { useDispatch, useTransactions } from '@/state'
import { useZodiacRoute } from '@/zodiac-routes'
import { invariant } from '@epic-web/invariant'
import { useEffect, useRef, useState } from 'react'
import { RiFileCopy2Line, RiRefreshLine } from 'react-icons/ri'
import { toast } from 'react-toastify'
import { RouteBubble } from './RouteBubble'
import { Submit } from './Submit'
import { Transaction } from './Transaction'
import classes from './style.module.css'
import { useGloballyApplicableTranslation } from '../transactionTranslations'

export const Transactions = () => {
  const transactions = useTransactions()
  const dispatch = useDispatch()
  const provider = useProvider()
  const route = useZodiacRoute()

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
    toast(<>Transaction data has been copied to clipboard.</>)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8 pt-4">
      <div className="px-4">
        <RouteBubble />
      </div>

      <div className="flex items-center justify-between px-6">
        <h4 className={classes.header}>Recording Transactions</h4>

        <div className="flex gap-1">
          <IconButton
            title="Copy batch transaction data to clipboard"
            disabled={transactions.length === 0}
            onClick={copyTransactionData}
          >
            <RiFileCopy2Line />
          </IconButton>
          <IconButton
            title="Re-simulate on current blockchain head"
            disabled={transactions.length === 0}
            onClick={reforkAndRerun}
          >
            <RiRefreshLine />
          </IconButton>

          <div className={classes.recordingIcon} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-8 overflow-hidden px-6">
        <div
          ref={scrollContainerRef}
          className="exp flex flex-grow flex-col gap-4 overflow-y-auto"
        >
          {transactions.map((transactionState, index) => (
            <Transaction
              key={transactionState.id}
              transactionState={transactionState}
              index={index}
              scrollIntoView={scrollItemIntoView === index}
            />
          ))}

          {transactions.length === 0 && (
            <p className={classes.hint}>
              As you interact with apps in the browser, transactions will be
              recorded here. You can then sign and submit them as a batch.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {!route.initiator && (
            <Button
              secondary
              onClick={copyTransactionData}
              disabled={transactions.length === 0}
            >
              Copy transaction data
            </Button>
          )}
          <Submit />
        </div>
      </div>
    </div>
  )
}
