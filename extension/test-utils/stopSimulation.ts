import { Message, PilotSimulationMessageType } from '@/pilot-messages'
import { chromeMock } from './chromeMock'

type StopSimulationOptions = {
  windowId: number
}

export const stopSimulation = ({ windowId }: StopSimulationOptions) => {
  chromeMock.runtime.onMessage.callListeners(
    {
      type: PilotSimulationMessageType.SIMULATE_STOP,
      windowId,
    } satisfies Message,
    { id: chrome.runtime.id },
    () => {}
  )
}
