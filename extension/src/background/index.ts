import { enableExternalPanelOpen } from './enableExternalPanelOpen'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

const trackRequestsResult = trackRequests()
trackSessions(trackRequestsResult)
trackSimulations()

enableExternalPanelOpen()

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))
