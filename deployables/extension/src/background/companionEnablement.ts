import { getRoutes } from '@/execution-routes'
import { COMPANION_APP_PORT } from '@/port-handling'
import { captureLastError } from '@/sentry'
import { getActiveTab, sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  PilotMessageType,
  type CompanionAppMessage,
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
    async (message: CompanionAppMessage, { tab }) => {
      switch (message.type) {
        case CompanionAppMessageType.REQUEST_FORK_INFO: {
          invariant(tab != null, 'Companion app message must come from a tab.')

          withPilotSession(tab.windowId, async (session) => {
            if (!session.isForked()) {
              return
            }

            invariant(tab.id != null, 'Tab needs an ID')

            await sendMessageToTab(tab.id, {
              type: CompanionResponseMessageType.FORK_UPDATED,
              forkUrl: session.getFork().rpcUrl ?? null,
            } satisfies CompanionResponseMessage)
          })

          console.debug('Companion App connected!')

          onSimulationUpdate.addListener(async (fork) => {
            invariant(tab.id != null, 'Tab needs an ID')

            console.debug('Sending updated fork to companion app', { fork })

            await sendMessageToTab(tab.id, {
              type: CompanionResponseMessageType.FORK_UPDATED,
              forkUrl: fork?.rpcUrl ?? null,
            } satisfies CompanionResponseMessage)

            captureLastError()
          })

          break
        }

        case CompanionAppMessageType.REQUEST_ROUTES: {
          invariant(tab != null, 'Companion app message must come from a tab.')
          invariant(tab.id != null, 'Tab needs an ID')

          const routes = await getRoutes()

          await sendMessageToTab(tab.id, {
            type: CompanionResponseMessageType.LIST_ROUTES,
            routes,
          } satisfies CompanionResponseMessage)
        }
      }

      return true
    },
  )

  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== COMPANION_APP_PORT) {
      return
    }

    const handlePing = async (
      message: CompanionAppMessage,
      { tab }: chrome.runtime.MessageSender,
    ) => {
      if (message.type !== CompanionAppMessageType.PING) {
        return
      }

      invariant(tab != null, 'Companion app message must come from a tab.')
      invariant(tab.id != null, 'Tab needs an ID')

      await sendMessageToTab(
        tab.id,
        {
          type: CompanionResponseMessageType.PONG,
        } satisfies CompanionResponseMessage,
        // bypass some tab validity checks so that this
        // message finds the companion app regardless of what
        // page the user is currently on
        { protocolCheckOnly: true },
      )
    }

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
