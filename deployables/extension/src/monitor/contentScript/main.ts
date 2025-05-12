// injects a minimal script into the page to hint the user to reload the page when the panel is toggled

import { injectScript } from '@/utils'
import { type Message, PilotMessageType } from '@zodiac/messages'

window.document.documentElement.dataset.__zodiacPilotBasePath =
  chrome.runtime.getURL('/')
window.document.documentElement.dataset.__zodiacExtensionId = chrome.runtime.id

injectScript('build/monitor/injectedScript/main.js')

chrome.runtime.onMessage.addListener((message: Message) => {
  if (
    message.type === PilotMessageType.PILOT_CONNECT ||
    message.type === PilotMessageType.PILOT_DISCONNECT
  ) {
    document.documentElement.dataset.__zodiacPilotConnected = (
      message.type === PilotMessageType.PILOT_CONNECT
    ).toString()
    window.postMessage(message, '*')
  }
})

export default {}
