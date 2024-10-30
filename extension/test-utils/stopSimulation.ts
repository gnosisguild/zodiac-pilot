import { Message, SIMULATE_STOP } from '../src/messages'
import { chromeMock } from './chromeMock'

type StopSimulationOptions = {
  windowId: number
}

export const stopSimulation = ({ windowId }: StopSimulationOptions) => {
  chromeMock.runtime.onMessage.callListeners(
    {
      type: SIMULATE_STOP,
      windowId,
    } satisfies Message,
    { id: chrome.runtime.id },
    () => {}
  )
}
