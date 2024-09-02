// This script will be injected via contentScript.ts into each tab
// It tracks if the Pilot panel is connected and if the Pilot provider is injected.
// Shows a reload hint if either connected+!injected or !connected+injected.

import { PILOT_CONNECT, PILOT_DISCONNECT } from '../messages'
import { Eip1193Provider } from '../types'

declare let window: Window & {
  zodiacPilot?: Eip1193Provider
}

function check() {
  if (
    document.documentElement.dataset.__zodiacPilotConnected === 'true' &&
    !window.zodiacPilot
  ) {
    console.log(
      '🕵 Zodiac Pilot is connected and the provider is not injected. Please reload the page.'
    )
  }

  if (
    document.documentElement.dataset.__zodiacPilotConnected === 'false' &&
    window.zodiacPilot
  ) {
    console.log(
      '🕵 Zodiac Pilot is closed but the provider is still injected. Please reload the page.'
    )
  }
}

// TODO maybe check only after a slight delay to give the PILOT_CONNECT message time to arrive
check()

window.addEventListener('message', (event: MessageEvent) => {
  if (
    event.data?.type === PILOT_CONNECT ||
    event.data?.type === PILOT_DISCONNECT
  ) {
    check()
  }
})

export {}
