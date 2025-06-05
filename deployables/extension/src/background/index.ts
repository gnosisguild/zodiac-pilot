import { sentry } from '@/sentry'
import { companionEnablement } from './companionEnablement'
import { enableExternalPanelOpen } from './enableExternalPanelOpen'
import { trackRequests } from './rpcRedirects'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

const trackRequestsResult = trackRequests()
const trackSessionsResult = trackSessions(trackRequestsResult)
const trackSimulationsResult = trackSimulations(trackSessionsResult)
companionEnablement(trackSessionsResult, trackSimulationsResult)

enableExternalPanelOpen()

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => sentry.captureException(error))

export default {}
