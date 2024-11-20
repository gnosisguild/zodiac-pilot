import { enableExternalPanelOpen } from './enableExternalPanelOpen'
import { trackRequests } from './rpcTracking'
import { trackSessions } from './sessionTracking'
import { trackSimulations } from './simulationTracking'

const trackRequestsResult = trackRequests()
trackSimulations()
trackSessions(trackRequestsResult)

enableExternalPanelOpen()

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))
