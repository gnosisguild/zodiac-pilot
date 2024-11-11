import { PilotSimulationMessageType, SimulationMessage } from '@/messages'
import { callListeners, chromeMock } from './chrome'

type StartSimulationOptions = {
  windowId: number
}

export const startSimulation = ({ windowId }: StartSimulationOptions) =>
  callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_START,
      windowId,
      networkId: 1,
      rpcUrl: 'http://test.com',
    } satisfies SimulationMessage,
    { id: chrome.runtime.id },
    () => {}
  )
