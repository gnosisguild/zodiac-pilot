import { captureLastError } from '@/sentry'
import { sendMessageToTab } from '@/utils'
import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  PilotMessageType,
  type CompanionAppMessage,
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
              type: CompanionAppMessageType.FORK_UPDATED,
              forkUrl: session.getFork().rpcUrl ?? null,
            } satisfies CompanionAppMessage)
          })

          console.debug('Companion App connected!')

          onSimulationUpdate.addListener(async (fork) => {
            invariant(tab.id != null, 'Tab needs an ID')

            console.debug('Sending updated fork to companion app', { fork })

            await sendMessageToTab(tab.id, {
              type: CompanionAppMessageType.FORK_UPDATED,
              forkUrl: fork?.rpcUrl ?? null,
            } satisfies CompanionAppMessage)

            captureLastError()
          })

          break
        }

        case CompanionAppMessageType.PING: {
          invariant(tab != null, 'Companion app message must come from a tab.')
          invariant(tab.id != null, 'Tab needs an ID')

          await sendMessageToTab(tab.id, {
            type: PilotMessageType.PONG,
          } satisfies Message)
        }
      }
    },
  )
}
