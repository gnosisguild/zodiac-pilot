import { invariant } from '@epic-web/invariant'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import type { TrackSimulationResult } from './simulationTracking'

export const companionEnablement = ({
  onSimulationUpdate,
}: TrackSimulationResult) => {
  chrome.runtime.onMessage.addListener(
    (message: CompanionAppMessage, { tab }) => {
      if (message.type !== CompanionAppMessageType.CONNECT) {
        return
      }

      invariant(tab != null, 'Companion app message must come from a tab.')

      onSimulationUpdate.addListener((fork) => {
        invariant(tab.id != null, 'Tab needs an ID')

        chrome.tabs.sendMessage(tab.id, {
          type: CompanionAppMessageType.FORK_UPDATED,
          forkUrl: fork?.rpcUrl ?? null,
        } satisfies CompanionAppMessage)
      })
    },
  )
}
