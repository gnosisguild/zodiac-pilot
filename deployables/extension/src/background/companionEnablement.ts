import { captureLastError } from '@/sentry'
import { sendMessageToTab } from '@/utils'
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
    },
  )
}
