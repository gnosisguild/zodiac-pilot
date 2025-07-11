import { useAccount, useSaveAccount } from '@/accounts'
import { createProposal } from '@/companion'
import { useOptionalExecutionRoute } from '@/execution-routes'
import { usePilotIsReady } from '@/port-handling'
import {
  useDecodeTransactions,
  usePendingTransactions,
  useRefreshTransactions,
  useTransactions,
  useTransactionTracking,
} from '@/transactions'
import { getString, sendMessageToCompanionApp } from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { getCompanionAppUrl } from '@zodiac/env'
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
import { Outlet, useNavigate, type ActionFunctionArgs } from 'react-router'
import { prefixAddress } from 'ser-kit'
import { ClearTransactionsModal } from '../ClearTransactionsModal'
import { RecordingIndicator } from './RecordingIndicator'
import { Sign } from './Sign'
import { Intent } from './intents'

export const action = async ({
  request,
  params: { activeAccountId, routeId },
}: ActionFunctionArgs) => {
  const data = await request.formData()

  const intent = getString(data, 'intent')

  switch (intent) {
    case Intent.CreateProposal: {
      const transaction = parseTransactionData(getString(data, 'transaction'))

      invariantResponse(
        isUUID(activeAccountId),
        'Can only create proposals for remote accounts',
      )

      invariantResponse(
        routeId != null,
        'No active route selected to create the proposal',
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
        url: `${getCompanionAppUrl()}/submit/proposal/${proposalId}/${routeId}`,
      })

      return null
    }
  }
}

const TransactionsLayout = () => {
  const transactions = useTransactions()
  const account = useAccount()
  const pendingTransactions = usePendingTransactions()
  const refreshTransactions = useRefreshTransactions()
  const navigate = useNavigate()
  const route = useOptionalExecutionRoute()
  const pilotIsReady = usePilotIsReady()

  const scrollContainerRef = useScrollIntoView()

  useTransactionTracking(account)
  useDecodeTransactions()

  const [saveOptions, saveAndActivateOptions] = useSaveAccount(account.id, {
    async onSave(route, updatedAccount, tabId) {
      await sendMessageToCompanionApp(tabId, {
        type: CompanionResponseMessageType.PROVIDE_ROUTE,
        route,
      })

      if (
        transactions.length === 0 ||
        prefixAddress(account.chainId, account.address) ===
          prefixAddress(updatedAccount.chainId, updatedAccount.address)
      ) {
        navigate(`/${updatedAccount.id}`)
      } else {
        navigate(`/${account.id}/clear-transactions/${updatedAccount.id}`)
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
        <WagmiProvider chainId={account.chainId}>
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

          {transactions.length === 0 ? (
            <div className="mt-32 flex flex-col gap-32">
              <Info title="No transactions">
                As you interact with apps in the browser, transactions will be
                recorded here. You can then sign and submit them as a batch.
              </Info>
            </div>
          ) : (
            <Outlet />
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

        <Sign route={route} />
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

export default TransactionsLayout

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
