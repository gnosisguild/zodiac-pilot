import { ChainId } from 'ser-kit'

export interface Fork {
  chainId: ChainId
  rpcUrl?: string
}
