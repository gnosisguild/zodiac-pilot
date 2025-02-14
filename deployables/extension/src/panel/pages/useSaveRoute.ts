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
import { useNavigate, useRevalidator } from 'react-router'

export const useSaveRoute = (lastUsedRouteId: string | null) => {
  const transactions = useTransactions()
  const { revalidate } = useRevalidator()
  const navigate = useNavigate()
  const [{ routeUpdate, sender, closeSender }, setPendingRouteUpdate] =
    useState<
      | { routeUpdate: null; sender: null; closeSender: boolean }
      | {
          routeUpdate: ExecutionRoute
          sender: chrome.runtime.MessageSender
          closeSender: boolean
        }
    >({ routeUpdate: null, sender: null, closeSender: false })

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

      if (
        message.type !== CompanionAppMessageType.SAVE_ROUTE &&
        message.type !== CompanionAppMessageType.SAVE_AND_LAUNCH
      ) {
        return
      }

      const incomingRoute = message.data

      if (
        lastUsedRouteId != null &&
        lastUsedRouteId === incomingRoute.id &&
        transactions.length > 0
      ) {
        const currentRoute = await getRoute(lastUsedRouteId)

        if (
          currentRoute.avatar.toLowerCase() !==
          incomingRoute.avatar.toLowerCase()
        ) {
          setPendingRouteUpdate({
            routeUpdate: incomingRoute,
            sender,
            closeSender: message.type === CompanionAppMessageType.SAVE_ROUTE,
          })

          return
        }
      }

      saveRoute(incomingRoute).then(() => {
        revalidate()

        switch (message.type) {
          case CompanionAppMessageType.SAVE_ROUTE: {
            closeTabAfterSafe(sender)

            break
          }

          case CompanionAppMessageType.SAVE_AND_LAUNCH: {
            navigate(`/${incomingRoute.id}`)

            break
          }
        }
      })
    }

    chrome.runtime.onMessage.addListener(handleSaveRoute)

    return () => {
      chrome.runtime.onMessage.removeListener(handleSaveRoute)
    }
  }, [lastUsedRouteId, navigate, revalidate, transactions.length])

  const cancelUpdate = useCallback(
    () =>
      setPendingRouteUpdate({
        routeUpdate: null,
        sender: null,
        closeSender: false,
      }),
    [],
  )

  const saveUpdate = useCallback(async () => {
    invariant(
      routeUpdate != null,
      'Tried to save a route when no save was pending',
    )

    await saveRoute(routeUpdate)

    setPendingRouteUpdate({
      routeUpdate: null,
      sender: null,
      closeSender: false,
    })

    if (closeSender) {
      closeTabAfterSafe(sender)
    }

    return routeUpdate
  }, [closeSender, routeUpdate, sender])

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
