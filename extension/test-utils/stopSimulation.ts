import { PilotSimulationMessageType, SimulationMessage } from '@/messages'
import { callListeners, chromeMock } from './chrome'

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
    { id: chromeMock.runtime.id },
    () => {}
  )
