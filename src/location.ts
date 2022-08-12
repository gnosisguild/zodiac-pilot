import { useEffect, useState } from 'react'

// The background script listens to all possible ways of location updates in our iframe and notify us via a message.
// let lastHref = ''
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.type === 'navigationDetected') {
//     // This actually means that a navigation happened anywhere in our extension tab (tab itself or any contained iframe).
//     // So not all events actually
//     const iframe = document.getElementById(
//       'pilot-frame'
//     ) as HTMLIFrameElement | null
//     const iframeWindow = iframe?.contentWindow
//     if (!iframeWindow) return

//     iframeWindow.postMessage({ zodiacPilotHrefRequest: true }, '*')

//     const handleMessage = (ev: MessageEvent) => {
//       const { zodiacPilotHrefResponse, href } = ev.data
//       if (zodiacPilotHrefResponse && href !== lastHref) {
//         console.debug('iframe navigated to', href)
//         window.removeEventListener('message', handleMessage)
//         replaceLocation(href) // don't push as this would mess with the browsing history
//         lastHref = href
//       }
//     }
//     window.addEventListener('message', handleMessage)
//   }
// })

const locationReplacedEvent = new Event('locationReplaced')
export const replaceLocation = (url: string) => {
  window.history.replaceState({}, '', '#' + encodeURIComponent(url))
  window.dispatchEvent(locationReplacedEvent)
}

const locationPushedEvent = new Event('locationPushed')
export const pushLocation = (url: string) => {
  window.history.pushState({}, '', '#' + encodeURIComponent(url))
  window.dispatchEvent(locationPushedEvent)
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

    window.addEventListener('locationReplaced', onChangeHash, false)
    window.addEventListener('locationPushed', onChangeHash, false)
    window.addEventListener('hashchange', onChangeHash, false)

    return () => {
      window.removeEventListener('locationReplaced', onChangeHash, false)
      window.removeEventListener('locationPushed', onChangeHash, false)
      window.removeEventListener('hashchange', onChangeHash, false)
    }
  }, [])
  return loc
}
