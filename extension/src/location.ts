import { useEffect, useState } from 'react'

const decodeLocationHash = () => {
  const { hash } = window.location
  if (hash[0] === '#' && hash.length > 1) {
    return decodeURIComponent(hash.substring(1))
  }
  return ''
}

export const requestIframeHref = async () => {
  const iframe = document.getElementById(
    'pilot-frame'
  ) as HTMLIFrameElement | null
  const iframeWindow = iframe?.contentWindow
  if (!iframeWindow) return

  iframeWindow.postMessage({ zodiacPilotHrefRequest: true }, '*')

  return new Promise<string>((resolve) => {
    const handleMessage = (ev: MessageEvent) => {
      const { zodiacPilotHrefResponse, href } = ev.data

      if (zodiacPilotHrefResponse) {
        window.removeEventListener('message', handleMessage)
        resolve(href)
      }
    }
    window.addEventListener('message', handleMessage)
  })
}

export const reloadIframe = () => {
  const iframe = document.getElementById(
    'pilot-frame'
  ) as HTMLIFrameElement | null
  const iframeWindow = iframe?.contentWindow
  if (!iframeWindow) return

  iframeWindow.postMessage({ zodiacPilotReloadRequest: true }, '*')
}

// The background script listens to all possible ways of location updates in our iframe and notify us via a message.
let lastHref = decodeLocationHash()
window.addEventListener('message', async (event) => {
  if (event.data.type === 'navigationDetected') {
    // This actually means that a navigation happened anywhere in our extension tab (tab itself or any contained iframe).
    const href = await requestIframeHref()
    if (href && href !== lastHref) {
      console.debug('iframe navigated to', href)

      // preserve the connections part of the location hash to keep the connection drawer open
      const [connectionsPart] = decodeLocationHash().split(';')
      const prefix = connectionsPart.startsWith('connections')
        ? connectionsPart + ';'
        : ''

      replaceLocation(prefix + href) // don't push as this would mess with the browsing history
      lastHref = href
    }
  }
})

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
