import type { ChainId } from 'ser-kit'

export interface Fork {
  chainId: ChainId
  rpcUrl?: string
  vnetId?: string
}
