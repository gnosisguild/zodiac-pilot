import { PilotSimulationMessageType, SimulationMessage } from '@/messages'
import { callListeners } from './callListeners'
import { chromeMock } from './chromeMock'

type StopSimulationOptions = {
  windowId: number
}

export const stopSimulation = ({ windowId }: StopSimulationOptions) =>
  callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_STOP,
      windowId,
    } satisfies SimulationMessage,
    { id: chrome.runtime.id },
    () => {}
  )
