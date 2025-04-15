import { getAccount } from '@/accounts'
import { getLastUsedRouteId } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { useStableHandler } from '@zodiac/ui'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { prefixAddress } from 'ser-kit'

type OnLaunchOptions = {
  onLaunch?: (routeId: string, tabId?: number) => void
}

export const useLaunchRoute = ({ onLaunch }: OnLaunchOptions = {}) => {
  const navigate = useNavigate()
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null)
  const transactions = useTransactions()
  const onLaunchRef = useStableHandler(onLaunch)

  const launchRoute = useCallback(
    async (accountId: string, tabId?: number) => {
      const activeAccountId = await getLastUsedRouteId()

      if (activeAccountId != null) {
        const activeAccount = await getAccount(activeAccountId)
        const newAccount = await getAccount(accountId)

        if (
          transactions.length > 0 &&
          prefixAddress(activeAccount.chainId, activeAccount.address) !==
            prefixAddress(newAccount.chainId, newAccount.address)
        ) {
          setPendingAccountId(accountId)

          return
        }
      }

      if (onLaunchRef.current != null) {
        onLaunchRef.current(accountId, tabId)
      }

      navigate(`/${accountId}`)
    },
    [onLaunchRef, transactions.length, navigate],
  )

  const cancelLaunch = useCallback(() => setPendingAccountId(null), [])

  const proceedWithLaunch = useCallback(async () => {
    const activeRouteId = await getLastUsedRouteId()

    setPendingAccountId(null)

    invariant(pendingAccountId != null, 'No route launch was pending')

    if (onLaunchRef.current != null) {
      onLaunchRef.current(pendingAccountId)
    }

    navigate(`/${activeRouteId}/clear-transactions/${pendingAccountId}`)
  }, [navigate, onLaunchRef, pendingAccountId])

  return [
    launchRoute,
    {
      isLaunchPending: pendingAccountId != null,
      cancelLaunch,
      proceedWithLaunch,
    },
  ] as const
}

export const useLaunchRouteOnMessage = (launchOptions: OnLaunchOptions) => {
  const [launchRoute, options] = useLaunchRoute(launchOptions)

  useTabMessageHandler(
    CompanionAppMessageType.LAUNCH_ROUTE,
    async ({ routeId }) => launchRoute(routeId),
  )

  return options
}
