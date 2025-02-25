import { getLastUsedRouteId, getRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { useMessageHandler } from '@/utils'
import { CompanionAppMessageType } from '@zodiac/messages'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'

export const useLaunchRoute = () => {
  const navigate = useNavigate()
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null)
  const transactions = useTransactions()

  useMessageHandler(CompanionAppMessageType.LAUNCH_ROUTE, async (message) => {
    const activeRouteId = await getLastUsedRouteId()

    if (activeRouteId != null) {
      const activeRoute = await getRoute(activeRouteId)
      const newRoute = await getRoute(message.routeId)

      if (transactions.length > 0 && activeRoute.avatar !== newRoute.avatar) {
        setPendingRouteId(message.routeId)

        return
      }
    }

    navigate(`/${message.routeId}`)
  })

  const cancelLaunch = useCallback(() => setPendingRouteId(null), [])

  const proceedWithLaunch = useCallback(async () => {
    const activeRouteId = await getLastUsedRouteId()

    setPendingRouteId(null)

    navigate(`/${activeRouteId}/clear-transactions/${pendingRouteId}`)
  }, [navigate, pendingRouteId])

  return {
    isLaunchPending: pendingRouteId != null,
    cancelLaunch,
    proceedWithLaunch,
  }
}
