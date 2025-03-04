import {
  PilotSimulationMessageType,
  type SimulationMessage,
} from '@zodiac/messages'
import type { ChainId } from 'ser-kit'
import { callListeners, chromeMock, createMockTab } from './chrome'

type StartSimulationOptions = {
  chainId?: ChainId
  rpcUrl?: string
  vnetId?: string
}

export const startSimulation = (
  tab: Partial<chrome.tabs.Tab>,
  { chainId = 1, rpcUrl, vnetId }: StartSimulationOptions = {},
) => {
  const currentTab = createMockTab(tab)

  return callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_START,
      windowId: currentTab.windowId,
      chainId,
      rpcUrl,
      vnetId,
    } satisfies SimulationMessage,
    { id: chrome.runtime.id, tab: currentTab },
    () => {},
  )
}
