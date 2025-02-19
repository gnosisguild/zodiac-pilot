import { useCompanionAppUrl } from '@/companion'
import { useTransactions } from '@/state'
import type { ExecutionRoute } from '@/types'
import { encode } from '@zodiac/schema'
import { InlineForm, SecondaryButton, SecondaryLinkButton } from '@zodiac/ui'
import { formatDistanceToNow } from 'date-fns'
import { useRef, useState } from 'react'
import type { PrefixedAddress } from 'ser-kit'
import { ClearTransactionsModal } from '../../ClearTransactionsModal'
import { ConnectionStack } from '../../ConnectionStack'
import { RemoveButton } from './RemoveButton'
import { Intent } from './intents'

interface RouteProps {
  currentlyActiveAvatar: PrefixedAddress | null
  route: ExecutionRoute
}

export const Route = ({ route, currentlyActiveAvatar }: RouteProps) => {
  const [confirmClearTransactions, setConfirmClearTransactions] =
    useState(false)
  const transactions = useTransactions()
  const formRef = useRef(null)

  return (
    <>
      <section
        aria-labelledby={route.id}
        className="flex flex-col gap-4 rounded-md border border-zinc-200 bg-zinc-100 p-4 dark:border-white/30 dark:bg-zinc-900"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h3
              id={route.id}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {route.label || <em>Unnamed route</em>}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="font-semibold dark:text-zinc-400">Last Used</div>
            <div className="opacity-70">
              {route.lastUsed ? (
                `${formatDistanceToNow(route.lastUsed)} ago`
              ) : (
                <>N/A</>
              )}
            </div>
          </div>
        </div>

        <ConnectionStack route={route} />

        <div className="flex justify-between">
          <RemoveButton routeId={route.id} intent={Intent.removeRoute} />

          <div className="flex gap-2">
            <SecondaryLinkButton
              openInNewWindow
              to={`${useCompanionAppUrl()}/edit/${encode(route)}`}
            >
              Edit
            </SecondaryLinkButton>

            <InlineForm ref={formRef} context={{ routeId: route.id }}>
              <SecondaryButton
                submit
                intent={Intent.launchRoute}
                onClick={(event) => {
                  if (transactions.length === 0) {
                    return
                  }
                  // we continue working with the same avatar, so don't have to clear the recorded transaction
                  const keepTransactionBundle =
                    currentlyActiveAvatar === route.avatar

                  if (keepTransactionBundle) {
                    return
                  }

                  setConfirmClearTransactions(true)

                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                Launch
              </SecondaryButton>
            </InlineForm>
          </div>
        </div>
      </section>

      <ClearTransactionsModal
        newActiveRouteId={route.id}
        intent={Intent.clearTransactions}
        open={confirmClearTransactions}
        onClose={() => setConfirmClearTransactions(false)}
      />
    </>
  )
}
