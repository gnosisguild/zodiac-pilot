// This script will be injected via contentScript.ts into each tab
// It tracks if the Pilot panel is connected and if the Pilot provider is injected.
// Shows a reload hint if either connected+!injected or !connected+injected.

import { PILOT_CONNECT, PILOT_DISCONNECT } from '../messages'
import { Eip1193Provider } from '../types'
import {
  dismissHint,
  renderConnectHint,
  renderDisconnectHint,
} from './renderHint'

declare let window: Window & {
  zodiacPilot?: Eip1193Provider
}

function check() {
  if (
    document.documentElement.dataset.__zodiacPilotConnected === 'true' &&
    !window.zodiacPilot
  ) {
    console.log(
      '🕵 Zodiac Pilot is open but the provider is not injected. Please reload the page.'
    )
    renderConnectHint()
  } else if (
    document.documentElement.dataset.__zodiacPilotConnected !== 'true' &&
    window.zodiacPilot
  ) {
    console.log(
      '🕵 Zodiac Pilot is closed but the provider is still injected. Please reload the page.'
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
    event.data?.type === PILOT_CONNECT ||
    event.data?.type === PILOT_DISCONNECT
  ) {
    check()
  }
})

export {}
