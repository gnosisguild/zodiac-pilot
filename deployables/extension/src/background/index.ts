import { sentry } from '@/sentry'
import { enableExternalPanelOpen } from './enableExternalPanelOpen'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

const trackRequestsResult = trackRequests()
const trackSessionsResult = trackSessions(trackRequestsResult)
trackSimulations(trackSessionsResult)

enableExternalPanelOpen()

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => sentry.captureException(error))
