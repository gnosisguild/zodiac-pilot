// injects a minimal script into the page to hint the user to reload the page when the panel is toggled

import { Message, PILOT_CONNECT, PILOT_DISCONNECT } from '../messages'

window.document.documentElement.dataset.__zodiacPilotBasePath =
  chrome.runtime.getURL('/')

function inject(scriptPath: string) {
  const node = document.createElement('script')
  node.type = 'text/javascript'
  node.async = false
  node.src = chrome.runtime.getURL(scriptPath)

  const parent = document.head || document.documentElement
  parent.insertBefore(node, parent.children[0])
  node.remove()
}

inject('build/monitor/injectedScript.js')

chrome.runtime.onMessage.addListener((message: Message) => {
  console.log('monitor content script received message', message)
  if (message.type === PILOT_CONNECT || message.type === PILOT_DISCONNECT) {
    document.documentElement.dataset.__zodiacPilotConnected = (
      message.type === PILOT_CONNECT
    ).toString()
    window.postMessage(message, '*')
  }
})

export {}
