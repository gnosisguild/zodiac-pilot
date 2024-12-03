import { injectScript } from '@/utils'

// prevent double injection
// (this can happen when when loading unpacked extensions)
if (document.documentElement.dataset.__zodiacPilotInjected !== 'true') {
  document.documentElement.dataset.__zodiacPilotInjected = 'true'

  injectScript('build/connect/injectedScript/main.js')
}
