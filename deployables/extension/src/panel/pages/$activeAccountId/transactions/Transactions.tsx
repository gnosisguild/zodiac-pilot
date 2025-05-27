import { editAccount, getAccount, useAccount } from '@/accounts'
import { useExecutionRoute } from '@/execution-routes'
import { usePilotIsReady } from '@/port-handling'
import { useGloballyApplicableTranslation } from '@/transaction-translation'
import {
  clearTransactions,
  refreshTransactions,
  useDecodeTransactions,
  useDeleteFork,
  useDispatch,
  usePendingTransactions,
  useProviderBridge,
  useRollbackTransaction,
  useSendTransactions,
  useTransactions,
} from '@/transactions'
import { invariant } from '@epic-web/invariant'
import { getInt, getString } from '@zodiac/form-data'
import { toMetaTransactionRequest } from '@zodiac/schema'
import {
  CopyToClipboard,
  GhostButton,
  Info,
  Modal,
  Page,
  PrimaryButton,
} from '@zodiac/ui'
import { RefreshCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { type ActionFunctionArgs } from 'react-router'
import { RecordingIndicator } from './RecordingIndicator'
import { Submit } from './Submit'
import { Transaction } from './Transaction'
import { Intent } from './intents'

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await request.formData()

  const intent = getString(data, 'intent')

  switch (intent) {
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
  const account = useAccount()
  const route = useExecutionRoute()
  const pilotIsReady = usePilotIsReady()
  const pendingTransactions = usePendingTransactions()

  useDeleteFork()
  useSendTransactions()
  useRollbackTransaction()
  useDecodeTransactions()

  useProviderBridge({
    chainId: account.chainId,
    account: account.address,
  })

  // for now we assume global translations are generally auto-applied, so we don't need to show a button for them
  useGloballyApplicableTranslation()

  const scrollContainerRef = useScrollIntoView()

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
              data={transactions.map(toMetaTransactionRequest)}
            >
              Copy batch transaction data to clipboard
            </CopyToClipboard>

            <GhostButton
              iconOnly
              size="small"
              icon={RefreshCcw}
              disabled={
                transactions.length === 0 || pendingTransactions.length > 0
              }
              onClick={() => dispatch(refreshTransactions())}
            >
              Re-simulate on current blockchain head
            </GhostButton>

            <ClearTransactions
              disabled={
                transactions.length === 0 || pendingTransactions.length > 0
              }
            />
          </div>
        </div>

        {transactions.map((transaction) => (
          <div id={`t-${transaction.id}`} key={transaction.id}>
            <Transaction transactionId={transaction.id} />
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="mt-32 flex flex-col gap-32">
            <Info title="No transactions">
              As you interact with apps in the browser, transactions will be
              recorded here. You can then sign and submit them as a batch.
            </Info>
          </div>
        )}
      </Page.Content>

      <Page.Footer>
        {(route == null || route.initiator == null) && pilotIsReady && (
          <CopyToClipboard
            data={transactions.map(toMetaTransactionRequest)}
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

const ClearTransactions = ({ disabled }: { disabled: boolean }) => {
  const [confirm, setConfirm] = useState(false)
  const dispatch = useDispatch()

  return (
    <>
      <GhostButton
        iconOnly
        icon={Trash2}
        style="critical"
        size="small"
        disabled={disabled}
        onClick={() => setConfirm(true)}
      >
        Clear transactions
      </GhostButton>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Clear transaction batch"
      >
        Are you sure you want to clear the transaction batch? This action cannot
        be undone.
        <Modal.Actions>
          <PrimaryButton
            style="critical"
            onClick={() => {
              dispatch(clearTransactions())

              setConfirm(false)
            }}
          >
            Clear
          </PrimaryButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Modal>
    </>
  )
}
