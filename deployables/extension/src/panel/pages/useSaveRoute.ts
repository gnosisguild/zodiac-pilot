import { getRoute, saveRoute } from '@/execution-routes'
import { captureLastError } from '@/sentry'
import { useTransactions } from '@/state'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { ExecutionRoute } from '@zodiac/schema'
import { useCallback, useEffect, useState } from 'react'
import { useRevalidator } from 'react-router'

export const useSaveRoute = (lastUsedRouteId: string | null) => {
  const transactions = useTransactions()
  const { revalidate } = useRevalidator()
  const [{ routeUpdate, sender }, setPendingRouteUpdate] = useState<
    | { routeUpdate: null; sender: null }
    | { routeUpdate: ExecutionRoute; sender: chrome.runtime.MessageSender }
  >({ routeUpdate: null, sender: null })

  useEffect(() => {
    const handleSaveRoute = async (
      message: CompanionAppMessage,
      sender: chrome.runtime.MessageSender,
    ) => {
      if (
        typeof message !== 'object' ||
        message == null ||
        !('type' in message)
      ) {
        return
      }

      if (message.type !== CompanionAppMessageType.SAVE_ROUTE) {
        return
      }

      const incomingRoute = message.data

      if (
        lastUsedRouteId == null ||
        lastUsedRouteId !== incomingRoute.id ||
        transactions.length === 0
      ) {
        saveRoute(incomingRoute).then(() => {
          revalidate()

          closeTabAfterSafe(sender)
        })
      } else {
        const currentRoute = await getRoute(lastUsedRouteId)

        if (
          currentRoute.avatar.toLowerCase() !==
          incomingRoute.avatar.toLowerCase()
        ) {
          setPendingRouteUpdate({ routeUpdate: incomingRoute, sender })
        }
      }
    }

    chrome.runtime.onMessage.addListener(handleSaveRoute)

    return () => {
      chrome.runtime.onMessage.removeListener(handleSaveRoute)
    }
  }, [lastUsedRouteId, revalidate, transactions.length])

  const cancelUpdate = useCallback(
    () => setPendingRouteUpdate({ routeUpdate: null, sender: null }),
    [],
  )

  const saveUpdate = useCallback(async () => {
    invariant(
      routeUpdate != null,
      'Tried to save a route when no save was pending',
    )

    await saveRoute(routeUpdate)

    setPendingRouteUpdate({ routeUpdate: null, sender: null })
    closeTabAfterSafe(sender)

    return routeUpdate
  }, [routeUpdate, sender])

  return {
    isUpdatePending: routeUpdate != null,
    cancelUpdate,
    saveUpdate,
  }
}

const closeTabAfterSafe = (sender: chrome.runtime.MessageSender) => {
  invariant(sender.tab != null, 'Message did not originate in a tab')
  invariant(sender.tab.id != null, 'Origin tab has no id')

  chrome.tabs.remove(sender.tab.id, () => {
    captureLastError()
  })
}
