// This script will be injected via contentScript.ts into each tab
// It tracks if the Pilot panel is connected and if the Pilot provider is injected.
// Shows a reload hint if either connected+!injected or !connected+injected.

import { PilotMessageType } from '@/messages'
import { invariant } from '@epic-web/invariant'
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
  const pilotConnected =
    document.documentElement.dataset.__zodiacPilotConnected === 'true'
  const providerInjected = window.zodiacPilot != null

  if (pilotConnected && !providerInjected) {
    console.log(
      '🕵 Zodiac Pilot is open but the provider is not injected. Please reload the page.'
    )
    renderConnectHint()
  } else if (!pilotConnected && providerInjected) {
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
    event.data?.type === PilotMessageType.PILOT_CONNECT ||
    event.data?.type === PilotMessageType.PILOT_DISCONNECT
  ) {
    check()
  }
})

const handleLoad = () => {
  window.removeEventListener('load', handleLoad)

  const button = document.getElementById('ZODIAC-PILOT::open-panel-button')

  invariant(button != null, 'No button to open side panel found')

  button.addEventListener('click', (event) => {
    event.preventDefault()
    event.stopPropagation()

    const extensionId =
      window.document.documentElement.dataset['__zodiacExtensionId']

    invariant(
      typeof extensionId === 'string',
      'Could not find zodiac extension id'
    )

    chrome.runtime.sendMessage(extensionId, {
      type: PilotMessageType.PILOT_OPEN_SIDEPANEL,
    })
  })
}

window.addEventListener('load', handleLoad)

export {}
