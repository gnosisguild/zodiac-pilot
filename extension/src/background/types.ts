import type { ChainId } from 'ser-kit'

export interface Fork {
  chainId: ChainId
  rpcUrl?: string
}

export type EventFn = (...args: any) => void

export type Event<T extends EventFn = () => void> = {
  addListener: (listener: T) => void
  removeListener: (listener: T) => void
  removeAllListeners: () => void
}
