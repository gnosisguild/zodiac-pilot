import { Message, SIMULATE_START } from '../src/messages'
import { chromeMock } from './chromeMock'

type StartSimulationOptions = {
  windowId: number
}

export const startSimulation = ({ windowId }: StartSimulationOptions) => {
  chromeMock.runtime.onMessage.callListeners(
    {
      type: SIMULATE_START,
      windowId,
      networkId: 1,
      rpcUrl: 'http://test.com',
    } satisfies Message,
    { id: chrome.runtime.id },
    () => {}
  )
}
