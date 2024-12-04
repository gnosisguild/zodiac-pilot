import { PilotSimulationMessageType, SimulationMessage } from '@/messages'
import { ChainId } from 'ser-kit'
import { callListeners, chromeMock } from './chrome'

type StartSimulationOptions = {
  windowId: number
  chainId?: ChainId
  rpcUrl?: string
}

export const startSimulation = ({
  windowId,
  chainId = 1,
  rpcUrl,
}: StartSimulationOptions) =>
  callListeners(
    chromeMock.runtime.onMessage,
    {
      type: PilotSimulationMessageType.SIMULATE_START,
      windowId,
      chainId,
      rpcUrl,
    } satisfies SimulationMessage,
    { id: chrome.runtime.id },
    () => {}
  )
