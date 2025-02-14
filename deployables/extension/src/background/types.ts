import type { ChainId } from 'ser-kit'

export interface Fork {
  chainId: ChainId
  rpcUrl?: string
}

export type EventFn = (...args: any) => void

type DisposeFn = () => void

export type Event<T extends EventFn = () => void> = {
  addListener: (listener: T) => DisposeFn
  removeListener: (listener: T) => void
  removeAllListeners: () => void
}
