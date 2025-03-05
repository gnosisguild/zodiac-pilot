import {
  PilotSimulationMessageType,
  type SimulationMessage,
} from '@zodiac/messages'
import { callListeners, chromeMock, createMockTab } from './chrome'

type UpdateSimulationOptions = {
  rpcUrl: string
  vnetId: string
}

export const updateSimulation = (
  tab: Partial<chrome.tabs.Tab>,
  { rpcUrl, vnetId }: UpdateSimulationOptions,
) => {
  const currentTab = createMockTab(tab)
  return callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_UPDATE,
      windowId: currentTab.windowId,
      rpcUrl,
      vnetId,
    } satisfies SimulationMessage,
    { id: chrome.runtime.id, tab: currentTab },
    () => {},
  )
}
