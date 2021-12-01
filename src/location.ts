import { useEffect, useState } from 'react'

// The background script listens to all possible ways of location updates in our iframe and notify us via a message.
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'navigationDetected') {
    // This actually means that a navigation happened anywhere in our extension tab (tab itself or any contained iframe).
    // So not all events actually
    const iframe = document.getElementById(
      'pilot-frame'
    ) as HTMLIFrameElement | null
    const iframeWindow = iframe?.contentWindow
    if (!iframeWindow) return

    iframeWindow.postMessage({ transactionPilotHrefRequest: true }, '*')

    const handleMessage = (ev: MessageEvent) => {
      const { transactionPilotHrefResponse, href } = ev.data
      if (transactionPilotHrefResponse) {
        console.log('iframe navigated to', href)
        window.removeEventListener('message', handleMessage)
      }
    }
    window.addEventListener('message', handleMessage)
  }
})

export const updateLocation = (url: string) => {
  window.location.hash = encodeURIComponent(url)
}

const decodeLocationHash = () => {
  const { hash } = window.location
  if (hash[0] === '#' && hash.length > 1) {
    return decodeURIComponent(hash.substring(1))
  }
  return ''
}

export const useLocation = () => {
  const [loc, setLoc] = useState(decodeLocationHash())
  useEffect(() => {
    const onChangeHash = () => setLoc(decodeLocationHash())
    window.addEventListener('hashchange', onChangeHash, false)

    return () => {
      window.removeEventListener('hashchange', onChangeHash, false)
    }
  })
  return loc
}
