import {
  PilotSimulationMessageType,
  type SimulationMessage,
} from '@zodiac/messages'
import { callListeners, chromeMock, createMockTab } from './chrome'

type UpdateSimulationOptions = {
  rpcUrl: string
}

export const updateSimulation = (
  tab: Partial<chrome.tabs.Tab>,
  { rpcUrl }: UpdateSimulationOptions,
) => {
  const currentTab = createMockTab(tab)

  return callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_UPDATE,
      windowId: currentTab.windowId,
      rpcUrl,
    } satisfies SimulationMessage,
    { id: chrome.runtime.id, tab: currentTab },
    () => {},
  )
}
