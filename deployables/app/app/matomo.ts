import { useEffect } from 'react'

function enableMatomo() {
  // @ts-expect-error - Matomo snippet is not typed
  const _paq = (window._paq = window._paq || [])
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['requireCookieConsent'])
  _paq.push(['trackPageView'])
  _paq.push(['enableLinkTracking'])

  const u = 'https://analytics.gnosisguild.org/'
  _paq.push(['setTrackerUrl', u + 'matomo.php'])
  _paq.push(['setSiteId', '2'])
  const d = document,
    g = d.createElement('script'),
    s = d.getElementsByTagName('script')[0]
  g.async = true
  g.src = u + 'matomo.js'
  s.parentNode!.insertBefore(g, s)
}

export const Matomo = () => {
  useEffect(() => {
    enableMatomo()
  }, [])
  return null
}
