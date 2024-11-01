import { PilotSimulationMessageType, SimulationMessage } from '@/messages'
import { chromeMock } from './chromeMock'

type StopSimulationOptions = {
  windowId: number
}

export const stopSimulation = ({ windowId }: StopSimulationOptions) => {
  chromeMock.runtime.onMessage.callListeners(
    {
      type: PilotSimulationMessageType.SIMULATE_STOP,
      windowId,
    } satisfies SimulationMessage,
    { id: chrome.runtime.id },
    () => {}
  )
}
