import {
  ConnectionStack,
  SecondaryButton,
  SecondaryLinkButton,
  Tag,
} from '@/components'
import { ZodiacRoute } from '@/types'
import { useRouteConnect, useZodiacRoute } from '@/zodiac-routes'
import { formatDistanceToNow } from 'date-fns'
import { Cable, PlugZap, Unplug } from 'lucide-react'
import { useState } from 'react'
import { asLegacyConnection } from '../legacyConnectionMigrations'
import { ClearTransactionsModal } from '../useConfirmClearTransaction'

interface RouteProps {
  route: ZodiacRoute
  onLaunch: (routeId: string) => void
}

export const Route = ({ onLaunch, route }: RouteProps) => {
  const [connected, connect] = useRouteConnect(route)
  const currentlySelectedRoute = useZodiacRoute()
  const [confirmClearTransactions, setConfirmClearTransactions] =
    useState(false)

  return (
    <>
      <div className="flex flex-col gap-4 rounded-md border border-white/30 bg-zinc-900 p-4">
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
            <div className="text-zodiac-light-mustard">Last Used</div>
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
