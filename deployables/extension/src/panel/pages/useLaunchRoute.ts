import { getLastUsedRouteId, getRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

type OnLaunchOptions = {
  onLaunch: (routeId: string) => void
}

export const useLaunchRoute = ({ onLaunch }: OnLaunchOptions) => {
  const navigate = useNavigate()
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null)
  const transactions = useTransactions()

  const onLaunchRef = useRef(onLaunch)

  useEffect(() => {
    onLaunchRef.current = onLaunch
  }, [onLaunch])

  useTabMessageHandler(
    CompanionAppMessageType.LAUNCH_ROUTE,
    async (message) => {
      const activeRouteId = await getLastUsedRouteId()

      if (activeRouteId != null) {
        const activeRoute = await getRoute(activeRouteId)
        const newRoute = await getRoute(message.routeId)

        if (transactions.length > 0 && activeRoute.avatar !== newRoute.avatar) {
          setPendingRouteId(message.routeId)

          return
        }
      }

      onLaunchRef.current(message.routeId)
    },
  )

  const cancelLaunch = useCallback(() => setPendingRouteId(null), [])

  const proceedWithLaunch = useCallback(async () => {
    const activeRouteId = await getLastUsedRouteId()

    setPendingRouteId(null)

    invariant(pendingRouteId != null, 'No route launch was pending')

    onLaunchRef.current(pendingRouteId)
    navigate(`/${activeRouteId}/clear-transactions/${pendingRouteId}`)
  }, [navigate, pendingRouteId])

  return {
    isLaunchPending: pendingRouteId != null,
    cancelLaunch,
    proceedWithLaunch,
  }
}
