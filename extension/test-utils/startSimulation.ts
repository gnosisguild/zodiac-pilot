import { Message, PilotSimulationMessageType } from '@/pilot-messages'
import { chromeMock } from './chromeMock'

type StartSimulationOptions = {
  windowId: number
}

export const startSimulation = ({ windowId }: StartSimulationOptions) => {
  chromeMock.runtime.onMessage.callListeners(
    {
      type: PilotSimulationMessageType.SIMULATE_START,
      windowId,
      networkId: 1,
      rpcUrl: 'http://test.com',
    } satisfies Message,
    { id: chrome.runtime.id },
    () => {}
  )
}
