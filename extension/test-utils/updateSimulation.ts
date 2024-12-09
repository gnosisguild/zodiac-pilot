import { PilotSimulationMessageType, type SimulationMessage } from '@/messages'
import { callListeners, chromeMock } from './chrome'

type UpdateSimulationOptions = {
  windowId: number
  rpcUrl: string
}

export const updateSimulation = ({
  windowId,
  rpcUrl,
}: UpdateSimulationOptions) =>
  callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_UPDATE,
      windowId,
      rpcUrl,
    } satisfies SimulationMessage,
    { id: chrome.runtime.id },
    () => {}
  )
