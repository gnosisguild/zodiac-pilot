import { ChainId } from 'ser-kit'
import { PilotSession } from './PilotSession'

export interface Fork {
  chainId: ChainId
  rpcUrl?: string
}

export type Sessions = Map<number, PilotSession>
