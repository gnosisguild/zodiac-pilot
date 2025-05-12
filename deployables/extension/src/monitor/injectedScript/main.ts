// This script will be injected via contentScript.ts into each tab
// It tracks if the Pilot panel is connected and if the Pilot provider is injected.
// Shows a reload hint if either connected+!injected or !connected+injected.

import type { Eip1193Provider } from '@/types'
import { getCompanionAppUrl } from '@zodiac/env'
import { PilotMessageType } from '@zodiac/messages'
import {
  dismissHint,
  renderConnectHint,
  renderDisconnectHint,
} from './renderHint'

declare let window: Window & {
  zodiacPilot?: Eip1193Provider
}

function check() {
  if (window.location.origin === getCompanionAppUrl()) {
    return
  }

  const pilotConnected =
    document.documentElement.dataset.__zodiacPilotConnected === 'true'
  const providerInjected = window.zodiacPilot != null

  if (pilotConnected && !providerInjected) {
    console.debug(
      '🕵 Zodiac Pilot is open but the provider is not injected. Please reload the page.',
    )
    renderConnectHint()
  } else if (!pilotConnected && providerInjected) {
    console.debug(
      '🕵 Zodiac Pilot is closed but the provider is still injected. Please reload the page.',
    )
    renderDisconnectHint()
  } else {
    dismissHint()
  }
}

// initially check after a slight delay to give the PILOT_CONNECT message time to arrive
window.setTimeout(() => {
  check()
}, 20)

window.addEventListener('message', (event: MessageEvent) => {
  if (
    event.data?.type === PilotMessageType.PILOT_CONNECT ||
    event.data?.type === PilotMessageType.PILOT_DISCONNECT
  ) {
    check()
  }
})

export default {}
