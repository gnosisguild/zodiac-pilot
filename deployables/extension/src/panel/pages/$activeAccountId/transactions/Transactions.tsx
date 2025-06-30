import { editAccount, getAccount, useAccount, useSaveAccount } from '@/accounts'
import { createProposal } from '@/companion'
import { useExecutionRoute } from '@/execution-routes'
import { usePilotIsReady } from '@/port-handling'
import {
  useDecodeTransactions,
  usePendingTransactions,
  useRefreshTransactions,
  useTransactions,
  useTransactionTracking,
} from '@/transactions'
import { sendMessageToCompanionApp } from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
import { getInt, getString } from '@zodiac/form-data'
import { CompanionResponseMessageType } from '@zodiac/messages'
import {
  isUUID,
  parseTransactionData,
  toMetaTransactionRequest,
} from '@zodiac/schema'
import {
  CopyToClipboard,
  GhostButton,
  Info,
  Modal,
  Page,
  PrimaryLinkButton,
  WagmiProvider,
} from '@zodiac/ui'
import { RefreshCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, type ActionFunctionArgs } from 'react-router'
import { ClearTransactionsModal } from '../ClearTransactionsModal'
import { Intent } from './intents'
import { RecordingIndicator } from './RecordingIndicator'
import { Sign } from './Sign'
import { Transaction } from './Transaction'

export const action = async ({
  request,
  params: { activeAccountId },
}: ActionFunctionArgs) => {
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

    case Intent.CreateProposal: {
      const transaction = parseTransactionData(getString(data, 'transaction'))

      invariantResponse(
        isUUID(activeAccountId),
        'Can only create proposals for remote accounts',
      )

      const { proposalId } = await createProposal(
        activeAccountId,
        transaction,
        {
          signal: request.signal,
        },
      )

      await chrome.tabs.create({
        active: true,
        url: `${getCompanionAppUrl()}/submit/proposal/${proposalId}`,
      })

      return null
    }
  }
}

const Transactions = () => {
  const transactions = useTransactions()
  const account = useAccount()
  const route = useExecutionRoute()
  const pilotIsReady = usePilotIsReady()
  const pendingTransactions = usePendingTransactions()
  const refreshTransactions = useRefreshTransactions()
  const navigate = useNavigate()

  useTransactionTracking(account)
  useDecodeTransactions()

  const scrollContainerRef = useScrollIntoView()

  const [saveOptions, saveAndActivateOptions] = useSaveAccount(account.id, {
    async onSave(route, account, tabId) {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })

      if (transactions.length === 0) {
        navigate(`/${account.id}`)
      } else {
        navigate(`/${account.id}/clear-transactions/${account.id}`)
      }
    },
  })

  useEffect(() => {
    if (saveOptions.isUpdatePending && transactions.length === 0) {
      saveOptions.saveUpdate()
    }
  }, [saveOptions, transactions.length])

  useEffect(() => {
    if (
      saveAndActivateOptions.isActivationPending &&
      transactions.length === 0
    ) {
      saveAndActivateOptions.proceedWithActivation()
    }
  }, [saveAndActivateOptions, transactions.length])

  return (
    <>
      <Page.Content ref={scrollContainerRef}>
        <WagmiProvider>
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
                onClick={() => refreshTransactions()}
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
        </WagmiProvider>
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

        <Sign />
      </Page.Footer>

      <ClearTransactionsModal
        open={
          saveAndActivateOptions.isActivationPending && transactions.length > 0
        }
        onCancel={saveAndActivateOptions.cancelActivation}
        onAccept={saveAndActivateOptions.proceedWithActivation}
      />

      <ClearTransactionsModal
        open={saveOptions.isUpdatePending && transactions.length > 0}
        onCancel={saveOptions.cancelUpdate}
        onAccept={saveOptions.saveUpdate}
      />
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
  const account = useAccount()

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
          <PrimaryLinkButton
            style="critical"
            to={`/${account.id}/clear-transactions/${account.id}`}
          >
            Clear
          </PrimaryLinkButton>

          <Modal.CloseAction>Cancel</Modal.CloseAction>
        </Modal.Actions>
      </Modal>
    </>
  )
}
