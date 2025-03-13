import { getLastUsedRouteId, getRoute } from '@/execution-routes'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import { CompanionAppMessageType, useTabMessageHandler } from '@zodiac/messages'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

type OnLaunchOptions = {
  onLaunch?: (routeId: string, tabId?: number) => void
}

export const useLaunchRoute = ({ onLaunch }: OnLaunchOptions = {}) => {
  const navigate = useNavigate()
  const [pendingRouteId, setPendingRouteId] = useState<string | null>(null)
  const transactions = useTransactions()

  const onLaunchRef = useRef(onLaunch)

  useEffect(() => {
    onLaunchRef.current = onLaunch
  }, [onLaunch])

  const launchRoute = useCallback(
    async (routeId: string, tabId?: number) => {
      const activeRouteId = await getLastUsedRouteId()

      if (activeRouteId != null) {
        const activeRoute = await getRoute(activeRouteId)
        const newRoute = await getRoute(routeId)

        if (transactions.length > 0 && activeRoute.avatar !== newRoute.avatar) {
          setPendingRouteId(routeId)

          return
        }
      }

      if (onLaunchRef.current != null) {
        onLaunchRef.current(routeId, tabId)
      }
    },
    [transactions.length],
  )

  const cancelLaunch = useCallback(() => setPendingRouteId(null), [])

  const proceedWithLaunch = useCallback(async () => {
    const activeRouteId = await getLastUsedRouteId()

    setPendingRouteId(null)

    invariant(pendingRouteId != null, 'No route launch was pending')

    if (onLaunchRef.current != null) {
      onLaunchRef.current(pendingRouteId)
    }

    navigate(`/${activeRouteId}/clear-transactions/${pendingRouteId}`)
  }, [navigate, pendingRouteId])

  return [
    launchRoute,
    {
      isLaunchPending: pendingRouteId != null,
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
