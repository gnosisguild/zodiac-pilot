import { getRoute, getRoutes } from '@/execution-routes'
import { COMPANION_APP_PORT } from '@/port-handling'
import { captureLastError } from '@/sentry'
import { getActiveTab, sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  createMessageHandler,
  PilotMessageType,
  type CompanionResponseMessage,
  type Message,
} from '@zodiac/messages'
import type { TrackSessionsResult } from './sessionTracking'
import type { TrackSimulationResult } from './simulationTracking'

export const companionEnablement = (
  { withPilotSession }: TrackSessionsResult,
  { onSimulationUpdate }: TrackSimulationResult,
) => {
  chrome.runtime.onMessage.addListener(
    createMessageHandler(
      CompanionAppMessageType.REQUEST_FORK_INFO,
      (_, { tabId, windowId }) => {
        withPilotSession(windowId, async (session) => {
          if (!session.isForked()) {
            return
          }

          await sendMessageToTab(tabId, {
            type: CompanionResponseMessageType.FORK_UPDATED,
            forkUrl: session.getFork().rpcUrl ?? null,
          } satisfies CompanionResponseMessage)
        })

        console.debug('Companion App connected!')

        const dispose = onSimulationUpdate.addListener(async (fork) => {
          console.debug('Sending updated fork to companion app', { fork })

          await sendMessageToTab(tabId, {
            type: CompanionResponseMessageType.FORK_UPDATED,
            forkUrl: fork?.rpcUrl ?? null,
          } satisfies CompanionResponseMessage)

          captureLastError()
        })

        const handleTabClose = (closedTabId: number) => {
          if (tabId !== closedTabId) {
            return
          }

          chrome.tabs.onRemoved.removeListener(handleTabClose)

          dispose()
        }

        chrome.tabs.onRemoved.addListener(handleTabClose)
      },
    ),
  )

  chrome.runtime.onMessage.addListener(
    createMessageHandler(
      CompanionAppMessageType.REQUEST_ROUTES,
      async (_, { tabId }) => {
        const routes = await getRoutes()

        await sendMessageToTab(
          tabId,
          {
            type: CompanionResponseMessageType.LIST_ROUTES,
            routes,
          } satisfies CompanionResponseMessage,
          { protocolCheckOnly: true },
        )
      },
    ),
  )

  chrome.runtime.onMessage.addListener(
    createMessageHandler(
      CompanionAppMessageType.REQUEST_ROUTE,
      async ({ routeId }, { tabId }) => {
        const route = await getRoute(routeId)

        await sendMessageToTab(
          tabId,
          {
            type: CompanionResponseMessageType.PROVIDE_ROUTE,
            route,
          } satisfies CompanionResponseMessage,
          { protocolCheckOnly: true },
        )
      },
    ),
  )

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== COMPANION_APP_PORT) {
      return
    }

    const handlePing = createMessageHandler(
      CompanionAppMessageType.PING,
      async (_, { tabId }) => {
        await sendMessageToTab(
          tabId,
          {
            type: CompanionResponseMessageType.PONG,
          } satisfies CompanionResponseMessage,
          // bypass some tab validity checks so that this
          // message finds the companion app regardless of what
          // page the user is currently on
          { protocolCheckOnly: true },
        )
      },
    )

    chrome.runtime.onMessage.addListener(handlePing)

    port.onDisconnect.addListener(async () => {
      chrome.runtime.onMessage.removeListener(handlePing)

      const activeTab = await getActiveTab()

      invariant(activeTab.id != null, 'Tab needs an ID')

      await sendMessageToTab(
        activeTab.id,
        {
          type: PilotMessageType.PILOT_DISCONNECT,
        } satisfies Message,
        // bypass some tab validity checks so that this
        // message finds the companion app regardless of what
        // page the user is currently on
        { protocolCheckOnly: true },
      )
    })
  })
}
