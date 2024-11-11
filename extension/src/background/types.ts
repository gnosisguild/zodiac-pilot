import { ChainId } from 'ser-kit'

export interface Fork {
  chainId: ChainId
  rpcUrl: string
}

type BaseSession = {
  id: number
  tabs: Set<number>
}

export type IdleSession = BaseSession & {
  fork: null
}

export type ForkedSession = BaseSession & {
  fork: Fork
}

export type PilotSession = IdleSession | ForkedSession
