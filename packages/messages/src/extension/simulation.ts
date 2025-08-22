import { type ChainId } from '@zodiac/chains'

export enum PilotSimulationMessageType {
  SIMULATE_START = 'SIMULATE_START',
  SIMULATE_UPDATE = 'SIMULATE_UPDATE',
  SIMULATE_STOP = 'SIMULATE_STOP',
}

interface SimulateStart {
  type: PilotSimulationMessageType.SIMULATE_START
  windowId: number
  chainId: ChainId
  rpcUrl: string
  vnetId: string
}

type SimulateUpdate = {
  type: PilotSimulationMessageType.SIMULATE_UPDATE
  windowId: number
  rpcUrl: string
  vnetId: string
}

interface SimulateStop {
  type: PilotSimulationMessageType.SIMULATE_STOP
  windowId: number
}

export type SimulationMessage = SimulateStart | SimulateStop | SimulateUpdate
