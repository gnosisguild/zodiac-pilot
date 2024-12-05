import { SecondaryButton, SecondaryLinkButton, Tag } from '@/components'
import {
  asLegacyConnection,
  useExecutionRoute,
  useRouteConnect,
} from '@/execution-routes'
import { ExecutionRoute } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Cable, PlugZap, Unplug } from 'lucide-react'
import { useState } from 'react'
import { ConnectionStack } from '../../ConnectionStack'
import { ClearTransactionsModal } from '../../useConfirmClearTransaction'

interface RouteProps {
  route: ExecutionRoute
  onLaunch: (routeId: string) => void
}

export const Route = ({ onLaunch, route }: RouteProps) => {
  const [connected, connect] = useRouteConnect(route)
  const currentlySelectedRoute = useExecutionRoute()
  const [confirmClearTransactions, setConfirmClearTransactions] =
    useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md border border-zinc-200 bg-zinc-100 p-4 dark:border-white/30 dark:bg-zinc-900">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="overflow-hidden text-ellipsis whitespace-nowrap">
              {route.label || <em>Unnamed route</em>}
            </h3>

            {connected ? (
              <Tag color="success" head={<Cable size={16} />} />
            ) : connect ? (
              <Tag color="warning" head={<PlugZap size={16} />} />
            ) : (
              <Tag color="danger" head={<Unplug size={16} />} />
            )}
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

        <ConnectionStack connection={asLegacyConnection(route)} />

        <div className="flex justify-end gap-2">
          <SecondaryLinkButton
            to={`/routes/${route.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            Edit
          </SecondaryLinkButton>

          <SecondaryButton
            onClick={async () => {
              // we continue working with the same avatar, so don't have to clear the recorded transaction
              const keepTransactionBundle =
                currentlySelectedRoute &&
                currentlySelectedRoute.avatar === route.avatar

              if (!keepTransactionBundle) {
                setConfirmClearTransactions(true)

                return
              }

              onLaunch(route.id)
            }}
          >
            Launch
          </SecondaryButton>
        </div>
      </div>

      <ClearTransactionsModal
        open={confirmClearTransactions}
        onClose={() => setConfirmClearTransactions(false)}
        onConfirm={() => onLaunch(route.id)}
      />
    </>
  )
}
