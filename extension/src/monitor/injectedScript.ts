// This script will be injected via contentScript.ts into each tab
// It tracks if the Pilot panel is connected and if the Pilot provider is injected.
// Shows a reload hint if either connected+!injected or !connected+injected.

import { invariant } from '@epic-web/invariant'
import {
  PILOT_CONNECT,
  PILOT_DISCONNECT,
  PILOT_OPEN_SIDEPANEL,
} from '../messages'
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

const handleLoad = () => {
  window.removeEventListener('load', handleLoad)

  const form = document.getElementById('ZODIAC-PILOT::open-panel-button')

  invariant(form != null, 'No form to open side panel found')
  invariant(form instanceof HTMLFormElement, 'Not a form')

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    event.stopPropagation()

    const data = new FormData(form)
    const extensionId = data.get('extensionId')

    invariant(typeof extensionId === 'string', 'Not a string')

    chrome.runtime.sendMessage(extensionId, {
      type: PILOT_OPEN_SIDEPANEL,
    })
  })
}

window.addEventListener('load', handleLoad)

export {}
